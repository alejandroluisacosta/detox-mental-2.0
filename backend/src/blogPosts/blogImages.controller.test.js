import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getPublicImage, postAdminImage } from './blogPosts.controller.js';

const IMAGE_ID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const jpeg = () => Buffer.from([0xff, 0xd8, 0xff, 0x00]);

const mockRes = () => {
  const res = {
    statusCode: null,
    body: null,
    headers: {},
    contentType: null,
    sent: null,
    status(code) {
      res.statusCode = code;
      return res;
    },
    json(payload) {
      res.body = payload;
      return res;
    },
    set(name, value) {
      res.headers[name] = value;
      return res;
    },
    type(value) {
      res.contentType = value;
      return res;
    },
    send(payload) {
      res.sent = payload;
      if (res.statusCode == null) res.statusCode = 200;
      return res;
    },
  };
  return res;
};

const memoryImageDb = () => {
  const rows = [];

  return {
    rows,
    async query(sql, params = []) {
      const text = sql.replace(/\s+/g, ' ');

      if (/INSERT INTO blog_images/.test(text)) {
        const [authorId, mimeType, bytes] = params;
        const row = {
          id: IMAGE_ID,
          author_id: authorId,
          mime_type: mimeType,
          bytes,
        };
        rows.push(row);
        return { rows: [{ id: row.id, mime_type: row.mime_type }] };
      }

      if (/FROM blog_images/.test(text) && /WHERE id = \$1/.test(text)) {
        const found = rows.find((row) => row.id === params[0]);
        return { rows: found ? [found] : [] };
      }

      return { rows: [] };
    },
  };
};

test('an admin upload stores the image and returns a public path', async () => {
  const db = memoryImageDb();
  const res = mockRes();

  await postAdminImage(
    {
      db,
      user: { id: 'author-1' },
      file: { buffer: jpeg(), mimetype: 'image/jpeg' },
    },
    res,
  );

  assert.equal(res.statusCode, 201);
  assert.deepEqual(res.body, {
    image: { id: IMAGE_ID, url: `/blog/images/${IMAGE_ID}` },
  });
  assert.equal(db.rows.length, 1);
  assert.equal(db.rows[0].author_id, 'author-1');
  assert.equal(db.rows[0].mime_type, 'image/jpeg');
});

test('a missing upload is 400 before anything is stored', async () => {
  const db = memoryImageDb();
  const res = mockRes();

  await postAdminImage({ db, user: { id: 'author-1' } }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, 'No image was received.');
  assert.equal(db.rows.length, 0);
});

test('anyone can read a stored image by id', async () => {
  const db = memoryImageDb();
  await postAdminImage(
    {
      db,
      user: { id: 'author-1' },
      file: { buffer: jpeg(), mimetype: 'image/jpeg' },
    },
    mockRes(),
  );

  const res = mockRes();
  await getPublicImage({ db, params: { id: IMAGE_ID } }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.contentType, 'image/jpeg');
  assert.equal(res.headers['Cache-Control'], 'public, max-age=31536000, immutable');
  assert.deepEqual(res.sent, jpeg());
});

test('an unknown or malformed image id is 404', async () => {
  const db = memoryImageDb();

  const missing = mockRes();
  await getPublicImage({ db, params: { id: IMAGE_ID } }, missing);
  assert.equal(missing.statusCode, 404);

  const malformed = mockRes();
  await getPublicImage({ db, params: { id: 'not-an-id' } }, malformed);
  assert.equal(malformed.statusCode, 404);
  assert.equal(db.rows.length, 0);
});
