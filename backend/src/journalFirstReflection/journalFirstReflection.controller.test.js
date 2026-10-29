import { test, mock, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { postFirstReflection } from './journalFirstReflection.controller.js';
import { memoryRateLimitDb } from '../rateLimit/rateLimit.testDb.js';

process.env.MAGIC_LINK_SECRET = 'test-secret';

const ENTRY = 'I keep postponing the conversation with my manager. '.repeat(5);

const REFLECTION = {
  summaryText: 'You name the avoidance yourself.',
  mainTopics: ['work'],
  bestQuote: 'I keep postponing the conversation',
  bestQuoteEntryId: null,
  socraticText: 'What would it cost to have it this week?',
  machiavelliText: 'Delay protects comfort, not the goal.',
  modelId: 'test-model',
};

const makeRes = () => ({
  statusCode: null,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
});

const makeHarness = ({ generate } = {}) => {
  const db = memoryRateLimitDb();
  const calls = [];
  const generateFirstReflection =
    generate ??
    (async (args) => {
      calls.push(args);
      return REFLECTION;
    });

  const send = async ({ ip = '1.1.1.1', content = ENTRY, locale = 'en', dbOverride } = {}) => {
    const req = {
      body: { content },
      headers: { 'accept-language': locale },
      socket: { remoteAddress: ip },
      db: dbOverride ?? db,
      generateFirstReflection,
      on() {},
      removeListener() {},
    };
    const res = makeRes();
    await postFirstReflection(req, res);
    return res;
  };

  return { db, calls, send };
};

afterEach(() => {
  delete process.env.FIRST_REFLECTION_DISABLED;
  mock.restoreAll();
});

test('returns the reflection for a visitor without storing anything but the rate-limit event', async () => {
  const { db, calls, send } = makeHarness();

  const res = await send({ content: `  ${ENTRY}  `, locale: 'es' });

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body.reflection, {
    summaryText: REFLECTION.summaryText,
    mainTopics: REFLECTION.mainTopics,
    bestQuote: REFLECTION.bestQuote,
    socraticText: REFLECTION.socraticText,
    machiavelliText: REFLECTION.machiavelliText,
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].content, ENTRY.trim());
  assert.equal(calls[0].locale, 'es');
  // memoryRateLimitDb throws on any query other than the rate-limit table,
  // so a successful call proves the entry was not written anywhere.
  assert.deepEqual(
    db.rows.map((row) => row.bucket).sort(),
    ['first_reflection_global', 'first_reflection_ip'],
  );
  assert.equal(JSON.stringify(db.rows).includes('postponing'), false);
  assert.equal(db.rows.some((row) => row.subject === '1.1.1.1'), false);
});

test('an IP gets 2 reflections per day; the 3rd is a 429 with no model call', async () => {
  const { calls, send } = makeHarness();

  assert.equal((await send({ ip: '1.1.1.1' })).statusCode, 200);
  assert.equal((await send({ ip: '1.1.1.1' })).statusCode, 200);
  const blocked = await send({ ip: '1.1.1.1' });

  assert.equal(blocked.statusCode, 429);
  assert.equal(blocked.body.code, 'first_reflection_rate_limited');
  assert.equal(calls.length, 2);
  assert.equal((await send({ ip: '2.2.2.2' })).statusCode, 200);
});

test('after 30 reflections across distinct IPs, a fresh IP is refused with no model call', async () => {
  const { calls, send } = makeHarness();

  for (let i = 0; i < 30; i += 1) {
    assert.equal((await send({ ip: `10.0.0.${i}` })).statusCode, 200);
  }
  const blocked = await send({ ip: '10.0.1.1' });

  assert.equal(blocked.statusCode, 429);
  assert.equal(blocked.body.code, 'first_reflection_rate_limited');
  assert.equal(calls.length, 30);
});

test('text under 200 characters is a 400 that spends no allowance and makes no model call', async () => {
  const { db, calls, send } = makeHarness();

  const res = await send({ content: 'x'.repeat(199) });

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.code, 'first_reflection_too_short');
  assert.equal(calls.length, 0);
  assert.equal(db.rows.length, 0);
});

test('text over 3000 characters is a 400 that spends no allowance and makes no model call', async () => {
  const { db, calls, send } = makeHarness();

  const res = await send({ content: 'x'.repeat(3001) });

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.code, 'first_reflection_too_long');
  assert.equal(calls.length, 0);
  assert.equal(db.rows.length, 0);
});

test('a non-string body is a 400 with no model call', async () => {
  const { calls, send } = makeHarness();

  const res = await send({ content: { text: ENTRY } });

  assert.equal(res.statusCode, 400);
  assert.equal(calls.length, 0);
});

test('a rate-limit database error fails closed with no model call', async () => {
  const { calls, send } = makeHarness();
  mock.method(console, 'error', () => {});
  const brokenDb = {
    async query() {
      throw new Error('connection refused');
    },
  };

  const res = await send({ dbOverride: brokenDb });

  assert.equal(res.statusCode, 429);
  assert.equal(calls.length, 0);
});

test('the kill switch refuses every request before any model call', async () => {
  const { db, calls, send } = makeHarness();
  process.env.FIRST_REFLECTION_DISABLED = 'true';

  const res = await send();

  assert.equal(res.statusCode, 503);
  assert.equal(calls.length, 0);
  assert.equal(db.rows.length, 0);
});

test('a model failure is a 502 and the visitor text never reaches the logs', async () => {
  const errorLog = mock.method(console, 'error', () => {});
  const { send } = makeHarness({
    generate: async ({ content }) => {
      throw new Error(`provider rejected input: ${content}`);
    },
  });

  const res = await send();

  assert.equal(res.statusCode, 502);
  const logged = JSON.stringify(
    errorLog.mock.calls.map((call) => call.arguments.map(String)),
  );
  assert.equal(logged.includes('postponing'), false);
});

test('a model timeout is a 504', async () => {
  mock.method(console, 'error', () => {});
  const { send } = makeHarness({
    generate: async () => {
      const err = new Error('summary_timeout');
      err.code = 'summary_timeout';
      throw err;
    },
  });

  const res = await send();

  assert.equal(res.statusCode, 504);
});
