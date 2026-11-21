import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { getJournalMemory } from './journalMemory.controller.js';

const USER_A = 'a0000000-0000-4000-8000-00000000000a';
const USER_B = 'b0000000-0000-4000-8000-00000000000b';

const ORIGINAL_NODE_ENV = process.env.NODE_ENV;
afterEach(() => {
  if (ORIGINAL_NODE_ENV === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = ORIGINAL_NODE_ENV;
});

// Behaves like Postgres for the one query this feature runs: it only narrows
// by user, by UTC calendar day, and sorts oldest first when the SQL says so.
const memoryDb = (rows) => ({
  async query(sql, params = []) {
    const text = sql.replace(/\s+/g, ' ');
    if (!/SELECT .* FROM journal_entries/.test(text)) {
      throw new Error(`unexpected query: ${text}`);
    }
    let result = [...rows];
    if (/user_id = \$1/.test(text)) {
      result = result.filter((row) => row.user_id === params[0]);
    }
    if (/\(created_at AT TIME ZONE 'UTC'\)::date = \$2::date/.test(text)) {
      result = result.filter((row) => row.created_at.toISOString().slice(0, 10) === params[1]);
    }
    if (/ORDER BY created_at ASC/.test(text)) {
      result.sort((a, b) => a.created_at - b.created_at);
    }
    return { rows: result };
  },
});

const entry = (id, userId, iso, content = `entry ${id}`) => ({
  id,
  user_id: userId,
  content,
  topics: [],
  created_at: new Date(iso),
});

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

const call = async ({ db, userId = USER_A, query = {} }) => {
  const res = mockRes();
  await getJournalMemory(
    { user: { id: userId }, query, db, headers: { 'accept-language': 'en' } },
    res,
  );
  return res;
};

test('entries from exactly one year ago are returned, oldest first, over the one-month ones', async () => {
  const db = memoryDb([
    entry('late', USER_A, '2025-11-21T22:15:00Z'),
    entry('early', USER_A, '2025-11-21T08:47:00Z'),
    entry('month', USER_A, '2026-10-21T09:00:00Z'),
  ]);

  const res = await call({ db, query: { date: '2026-11-21' } });

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.today, '2026-11-21');
  assert.equal(res.body.memory.horizon, '1y');
  assert.equal(res.body.memory.date, '2025-11-21');
  assert.deepEqual(
    res.body.memory.entries.map((e) => e.id),
    ['early', 'late'],
  );
});

test('with nothing from a year ago, entries from exactly one month ago are returned', async () => {
  const db = memoryDb([entry('month', USER_A, '2026-10-21T09:00:00Z', 'a month back')]);

  const res = await call({ db, query: { date: '2026-11-21' } });

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.memory.horizon, '1m');
  assert.equal(res.body.memory.entries[0].content, 'a month back');
});

test('a near miss is not an anniversary: no memory is returned', async () => {
  const db = memoryDb([
    entry('day-before', USER_A, '2026-10-20T09:00:00Z'),
    entry('day-after', USER_A, '2025-11-22T09:00:00Z'),
  ]);

  const res = await call({ db, query: { date: '2026-11-21' } });

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.memory, null);
});

test('the anniversary day is the UTC calendar day the entry was written', async () => {
  const db = memoryDb([
    entry('previous-utc-day', USER_A, '2025-11-20T23:30:00Z'),
    entry('just-after-midnight', USER_A, '2025-11-21T00:10:00Z'),
  ]);

  const res = await call({ db, query: { date: '2026-11-21' } });

  assert.deepEqual(
    res.body.memory.entries.map((e) => e.id),
    ['just-after-midnight'],
  );
});

test("another user's anniversary entries are never returned", async () => {
  const db = memoryDb([entry('b-private', USER_B, '2025-11-21T08:00:00Z')]);

  const res = await call({ db, userId: USER_A, query: { date: '2026-11-21' } });

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.memory, null);
});

test('in production the date override is ignored and today is the real UTC date', async () => {
  process.env.NODE_ENV = 'production';
  const db = memoryDb([entry('old', USER_A, '2019-01-01T08:00:00Z')]);

  const res = await call({ db, query: { date: '2020-01-01' } });

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.today, new Date().toISOString().slice(0, 10));
  assert.notEqual(res.body.memory?.date, '2019-01-01');
});

test('outside production a malformed date override is rejected', async () => {
  const res = await call({ db: memoryDb([]), query: { date: '2026-02-30' } });

  assert.equal(res.statusCode, 400);
});

test('a database failure answers 500 without leaking details', async () => {
  const db = {
    async query() {
      throw new Error('connection refused at 10.0.0.1');
    },
  };

  const res = await call({ db, query: { date: '2026-11-21' } });

  assert.equal(res.statusCode, 500);
  assert.doesNotMatch(res.body.message, /10\.0\.0\.1/);
});
