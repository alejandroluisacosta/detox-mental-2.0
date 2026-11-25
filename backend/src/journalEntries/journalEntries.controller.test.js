import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getJournalEntries,
  getJournalMemory,
  postJournalEntry,
} from './journalEntries.controller.js';

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

test('getJournalEntries returns 400 for an unsupported topic filter', async () => {
  const req = {
    user: { id: 'user-a' },
    query: { topic: 'work' },
    headers: { 'accept-language': 'en' },
  };
  const res = mockRes();

  await getJournalEntries(req, res);

  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /not valid/i);
});

test('postJournalEntry rejects an entry over 10,000 characters before touching the database', async () => {
  const req = {
    user: { id: 'user-a' },
    body: { content: 'x'.repeat(10001) },
    headers: { 'accept-language': 'en' },
  };
  const res = mockRes();

  await postJournalEntry(req, res);

  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /10000 characters/);
});

// ---- "On this day" journal memory ----

const USER_A = 'user-a';
const USER_B = 'user-b';

/**
 * In-memory journal_entries table for the memory lookup. It only answers the
 * exact query shape the service must send: entries owned by $1 whose created_at
 * falls in [$2, $3), oldest first. Any other SQL throws, so dropping the user
 * filter, the day window, or the ordering fails these tests.
 */
const MEMORY_SQL =
  'SELECT id, content, topics, created_at FROM journal_entries ' +
  'WHERE user_id = $1 AND created_at >= $2 AND created_at < $3 ' +
  'ORDER BY created_at ASC';

const memoryEntriesDb = (seed = [], { fail = false } = {}) => {
  const rows = seed.map((row, index) => ({
    id: row.id ?? `entry-${index + 1}`,
    user_id: row.userId ?? USER_A,
    content: row.content ?? `entry ${index + 1}`,
    topics: row.topics ?? [],
    created_at: new Date(row.createdAt),
  }));
  return {
    async query(sql, params = []) {
      if (fail) throw new Error('connection refused: secret-host:5432');
      const text = sql.replace(/\s+/g, ' ').trim();
      if (text !== MEMORY_SQL) throw new Error(`unexpected SQL: ${text}`);
      const [userId, from, to] = params;
      const fromTime = new Date(from).getTime();
      const toTime = new Date(to).getTime();
      return {
        rows: rows
          .filter(
            (row) =>
              row.user_id === userId &&
              row.created_at.getTime() >= fromTime &&
              row.created_at.getTime() < toTime,
          )
          .sort((a, b) => a.created_at - b.created_at),
      };
    },
  };
};

const getMemory = async ({
  db,
  userId = USER_A,
  now = new Date('2026-11-19T15:00:00.000Z'),
  query = {},
  locale = 'en',
}) => {
  const res = mockRes();
  await getJournalMemory(
    { user: { id: userId }, db, now, query, headers: { 'accept-language': locale } },
    res,
  );
  return res;
};

const withNodeEnv = async (value, fn) => {
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = value;
  try {
    return await fn();
  } finally {
    if (previous === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previous;
  }
};

test('journal memory returns entries from exactly one year ago, oldest first, over one-month ones', async () => {
  const db = memoryEntriesDb([
    { id: 'late', content: 'evening', createdAt: '2025-11-19T22:15:00.000Z' },
    { id: 'early', content: 'morning', createdAt: '2025-11-19T08:47:00.000Z' },
    { id: 'month', createdAt: '2026-10-19T10:00:00.000Z' },
  ]);

  const res = await getMemory({ db });

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.today, '2026-11-19');
  assert.equal(res.body.memory.horizon, '1y');
  assert.equal(res.body.memory.date, '2025-11-19');
  assert.deepEqual(
    res.body.memory.entries.map((entry) => entry.id),
    ['early', 'late'],
  );
  assert.deepEqual(Object.keys(res.body.memory.entries[0]).sort(), [
    'content',
    'createdAt',
    'id',
    'topics',
  ]);
  assert.equal(res.body.memory.entries[0].content, 'morning');
});

test('journal memory falls back to exactly one month ago when a year ago is empty', async () => {
  const db = memoryEntriesDb([{ id: 'month', createdAt: '2026-10-19T10:00:00.000Z' }]);

  const res = await getMemory({ db });

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.memory.horizon, '1m');
  assert.equal(res.body.memory.date, '2026-10-19');
  assert.deepEqual(res.body.memory.entries.map((entry) => entry.id), ['month']);
});

test('journal memory is null for entries a day before or after either anniversary', async () => {
  const db = memoryEntriesDb([
    { createdAt: '2025-11-18T12:00:00.000Z' },
    { createdAt: '2025-11-20T12:00:00.000Z' },
    { createdAt: '2026-10-18T12:00:00.000Z' },
    { createdAt: '2026-10-20T12:00:00.000Z' },
  ]);

  const res = await getMemory({ db });

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { today: '2026-11-19', memory: null });
});

test('journal memory uses the UTC calendar day for both today and the entry', async () => {
  const db = memoryEntriesDb([
    { id: 'day-before', createdAt: '2025-11-18T23:30:00.000Z' },
    { id: 'just-after-midnight', createdAt: '2025-11-19T00:10:00.000Z' },
  ]);

  // 00:30 UTC on Nov 19 is still Nov 18 in the Americas; the UTC date wins.
  const res = await getMemory({ db, now: new Date('2026-11-19T00:30:00.000Z') });

  assert.equal(res.body.today, '2026-11-19');
  assert.deepEqual(
    res.body.memory.entries.map((entry) => entry.id),
    ['just-after-midnight'],
  );
});

test("journal memory never returns another user's anniversary entries", async () => {
  const db = memoryEntriesDb([
    { userId: USER_B, content: 'b private', createdAt: '2025-11-19T09:00:00.000Z' },
    { userId: USER_B, content: 'b month', createdAt: '2026-10-19T09:00:00.000Z' },
  ]);

  const res = await getMemory({ db, userId: USER_A });

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.memory, null);
});

test('journal memory rolls the one-month lookup back into December in January', async () => {
  const db = memoryEntriesDb([{ id: 'dec', createdAt: '2026-12-15T09:00:00.000Z' }]);

  const res = await getMemory({ db, now: new Date('2027-01-15T09:00:00.000Z') });

  assert.equal(res.body.memory.horizon, '1m');
  assert.equal(res.body.memory.date, '2026-12-15');
});

test('journal memory has no one-month anniversary on the 31st after a shorter month', async () => {
  const db = memoryEntriesDb([
    { createdAt: '2026-11-30T09:00:00.000Z' },
    { createdAt: '2026-12-01T09:00:00.000Z' },
  ]);

  const res = await getMemory({ db, now: new Date('2026-12-31T09:00:00.000Z') });

  assert.equal(res.body.memory, null);
});

test('journal memory still finds the yearly anniversary on the 31st after a shorter month', async () => {
  const db = memoryEntriesDb([{ id: 'year', createdAt: '2025-12-31T09:00:00.000Z' }]);

  const res = await getMemory({ db, now: new Date('2026-12-31T09:00:00.000Z') });

  assert.equal(res.body.memory.horizon, '1y');
  assert.equal(res.body.memory.date, '2025-12-31');
});

test('Feb 29 entries get no yearly anniversary but do get a monthly one on Mar 29', async () => {
  const db = memoryEntriesDb([{ id: 'leap', createdAt: '2028-02-29T09:00:00.000Z' }]);

  const nextYear = await getMemory({ db, now: new Date('2029-03-01T09:00:00.000Z') });
  const feb28 = await getMemory({ db, now: new Date('2029-02-28T09:00:00.000Z') });
  const mar29 = await getMemory({ db, now: new Date('2028-03-29T09:00:00.000Z') });

  assert.equal(nextYear.body.memory, null);
  assert.equal(feb28.body.memory, null);
  assert.equal(mar29.body.memory.horizon, '1m');
  assert.equal(mar29.body.memory.date, '2028-02-29');
});

test('outside production, ?date pretends today is that UTC date', async () => {
  const db = memoryEntriesDb([{ id: 'override', createdAt: '2024-03-10T09:00:00.000Z' }]);

  const res = await withNodeEnv('development', () =>
    getMemory({ db, query: { date: '2025-03-10' } }),
  );

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.today, '2025-03-10');
  assert.deepEqual(res.body.memory.entries.map((entry) => entry.id), ['override']);
});

test('in production, ?date is ignored and the real UTC date is used', async () => {
  const db = memoryEntriesDb([
    { id: 'override', createdAt: '2024-03-10T09:00:00.000Z' },
    { id: 'real', createdAt: '2025-11-19T09:00:00.000Z' },
  ]);

  const res = await withNodeEnv('production', () =>
    getMemory({ db, query: { date: '2025-03-10' } }),
  );

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.today, '2026-11-19');
  assert.deepEqual(res.body.memory.entries.map((entry) => entry.id), ['real']);
});

test('outside production, a malformed or impossible ?date is a 400', async () => {
  const db = memoryEntriesDb();

  for (const date of ['2026-02-30', '2026-13-01', 'yesterday', '2026-1-05', ['2026-01-05']]) {
    const res = await withNodeEnv('development', () => getMemory({ db, query: { date } }));
    assert.equal(res.statusCode, 400, `expected 400 for ${JSON.stringify(date)}`);
    assert.match(res.body.message, /date/i);
  }
});

test('a database failure is a localized 500 that leaks no internals', async () => {
  const db = memoryEntriesDb([], { fail: true });
  const originalError = console.error;
  console.error = () => {};
  try {
    const en = await getMemory({ db });
    const es = await getMemory({ db, locale: 'es' });

    assert.equal(en.statusCode, 500);
    assert.equal(es.statusCode, 500);
    assert.doesNotMatch(JSON.stringify(en.body), /secret-host|connection/);
    assert.notEqual(en.body.message, es.body.message);
    assert.deepEqual(Object.keys(en.body), ['message']);
  } finally {
    console.error = originalError;
  }
});
