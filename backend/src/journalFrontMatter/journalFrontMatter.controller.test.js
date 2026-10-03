import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getMeditationFrontMatter,
  patchMeditationFrontMatter,
} from './journalFrontMatter.controller.js';

const mockRes = () => {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      res.statusCode = code;
      return res;
    },
    json(payload) {
      res.body = payload;
      return res;
    },
  };
  return res;
};

const memoryDb = () => {
  const rows = new Map();
  let insertCount = 0;

  return {
    insertCount: () => insertCount,
    rowForUser: (userId) => rows.get(userId),
    async query(sql, params = []) {
      const text = sql.replace(/\s+/g, ' ');

      if (
        /SELECT/.test(text)
        && /journal_meditation_front_matter/.test(text)
        && /user_id = \$1/.test(text)
      ) {
        const userId = params[0];
        const row = rows.get(userId);
        if (!row) return { rows: [] };
        return { rows: [{ ...row }] };
      }

      if (
        /INSERT INTO journal_meditation_front_matter/.test(text)
        && /ON CONFLICT/.test(text)
      ) {
        insertCount += 1;
        const [
          userId,
          setTitle,
          title,
          setAuthorName,
          authorName,
          setIntroduction,
          introduction,
        ] = params;
        const existing = rows.get(userId);
        const next = existing
          ? {
              title: setTitle ? title : existing.title,
              author_name: setAuthorName ? authorName : existing.author_name,
              introduction: setIntroduction ? introduction : existing.introduction,
              title_uses_default: setTitle ? false : existing.title_uses_default ?? true,
            }
          : {
              title: setTitle ? title : '',
              author_name: setAuthorName ? authorName : '',
              introduction: setIntroduction ? introduction : '',
              title_uses_default: setTitle ? false : true,
            };
        rows.set(userId, next);
        return { rows: [{ ...next }] };
      }

      return { rows: [] };
    },
  };
};

const reqFor = (userId, db, body = undefined) => ({
  user: { id: userId },
  db,
  body,
  headers: { 'accept-language': 'en' },
});

test('GET with no row returns empty front matter without INSERT', async () => {
  const db = memoryDb();
  const res = mockRes();
  await getMeditationFrontMatter(reqFor('user-a', db), res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, {
    frontMatter: { title: '', authorName: '', introduction: '', titleUsesDefault: true },
  });
  assert.equal(db.insertCount(), 0);
});

test('PATCH introduction persists and GET returns it', async () => {
  const db = memoryDb();
  const prose = 'One.\n\nTwo.';

  const patchRes = mockRes();
  await patchMeditationFrontMatter(
    reqFor('user-a', db, { introduction: prose }),
    patchRes,
  );
  assert.equal(patchRes.statusCode, 200);
  assert.equal(patchRes.body.frontMatter.introduction, prose);

  const getRes = mockRes();
  await getMeditationFrontMatter(reqFor('user-a', db), getRes);
  assert.equal(getRes.body.frontMatter.introduction, prose);
});

test('PATCH whitespace-only introduction stores empty string', async () => {
  const db = memoryDb();
  const res = mockRes();
  await patchMeditationFrontMatter(
    reqFor('user-a', db, { introduction: '  \n  ' }),
    res,
  );
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.frontMatter.introduction, '');
});

test('introduction PATCH keeps title and author from a prior cover PATCH', async () => {
  const db = memoryDb();

  await patchMeditationFrontMatter(
    reqFor('user-a', db, { title: 'Book', authorName: 'Ada' }),
    mockRes(),
  );

  const res = mockRes();
  await patchMeditationFrontMatter(
    reqFor('user-a', db, { introduction: 'Prose' }),
    res,
  );

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body.frontMatter, {
    title: 'Book',
    authorName: 'Ada',
    introduction: 'Prose',
    titleUsesDefault: false,
  });
});

test('title PATCH keeps introduction from a prior introduction PATCH', async () => {
  const db = memoryDb();

  await patchMeditationFrontMatter(
    reqFor('user-a', db, { introduction: 'Prose' }),
    mockRes(),
  );

  const res = mockRes();
  await patchMeditationFrontMatter(reqFor('user-a', db, { title: 'Book' }), res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body.frontMatter, {
    title: 'Book',
    authorName: '',
    introduction: 'Prose',
    titleUsesDefault: false,
  });
});

test('users cannot read or overwrite each other front matter', async () => {
  const db = memoryDb();

  await patchMeditationFrontMatter(
    reqFor('user-a', db, { introduction: 'A prose', title: 'A title' }),
    mockRes(),
  );
  await patchMeditationFrontMatter(
    reqFor('user-b', db, { introduction: 'B prose' }),
    mockRes(),
  );

  const resA = mockRes();
  await getMeditationFrontMatter(reqFor('user-a', db), resA);
  assert.deepEqual(resA.body.frontMatter, {
    title: 'A title',
    authorName: '',
    introduction: 'A prose',
    titleUsesDefault: false,
  });

  const resB = mockRes();
  await getMeditationFrontMatter(reqFor('user-b', db), resB);
  assert.deepEqual(resB.body.frontMatter, {
    title: '',
    authorName: '',
    introduction: 'B prose',
    titleUsesDefault: true,
  });
});

test('PATCH non-string introduction is 400 and leaves empty record', async () => {
  const db = memoryDb();
  const res = mockRes();
  await patchMeditationFrontMatter(
    reqFor('user-a', db, { introduction: 1 }),
    res,
  );
  assert.equal(res.statusCode, 400);

  const getRes = mockRes();
  await getMeditationFrontMatter(reqFor('user-a', db), getRes);
  assert.deepEqual(getRes.body.frontMatter, {
    title: '',
    authorName: '',
    introduction: '',
    titleUsesDefault: true,
  });
  assert.equal(db.insertCount(), 0);
});

test('PATCH empty title clears the cover title and turns off the default flag', async () => {
  const db = memoryDb();
  const res = mockRes();
  await patchMeditationFrontMatter(reqFor('user-a', db, { title: '' }), res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body.frontMatter, {
    title: '',
    authorName: '',
    introduction: '',
    titleUsesDefault: false,
  });
});

test('PATCH empty body object is 400 and inserts nothing', async () => {
  const db = memoryDb();
  const res = mockRes();
  await patchMeditationFrontMatter(reqFor('user-a', db, {}), res);
  assert.equal(res.statusCode, 400);
  assert.equal(db.insertCount(), 0);
});
