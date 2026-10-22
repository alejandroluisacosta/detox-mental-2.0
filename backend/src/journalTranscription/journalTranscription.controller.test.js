import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { postJournalTranscription } from './journalTranscription.controller.js';
import { memoryRateLimitDb } from '../rateLimit/rateLimit.testDb.js';

const PNG_BUFFER = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
const DAY_MS = 24 * 60 * 60 * 1000;
const T0 = new Date('2026-10-01T12:00:00.000Z');

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

const makeHarness = () => {
  const db = memoryRateLimitDb();
  const calls = { transcriber: 0 };
  const transcribeJournalImage = async () => {
    calls.transcriber += 1;
    return 'texto';
  };

  const send = async ({ userId, file = { buffer: PNG_BUFFER, mimetype: 'image/png' }, locale = 'en', dbOverride } = {}) => {
    const req = {
      user: { id: userId },
      file,
      headers: { 'accept-language': locale },
      db: dbOverride ?? db,
      transcribeJournalImage,
    };
    const res = makeRes();
    await postJournalTranscription(req, res);
    return res;
  };

  return { db, calls, send };
};

test('a user gets 3 transcriptions per day; the 4th is a localized 429 with no model call', async () => {
  const { calls, send } = makeHarness();

  for (let i = 0; i < 3; i += 1) {
    const res = await send({ userId: 'user-a', locale: 'es' });
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, { text: 'texto' });
  }

  const blocked = await send({ userId: 'user-a', locale: 'es' });
  assert.equal(blocked.statusCode, 429);
  assert.match(blocked.body.message, /límite de transcripciones/);
  assert.equal(calls.transcriber, 3);
});

test('the 429 message is English when the locale is English', async () => {
  const { send } = makeHarness();
  for (let i = 0; i < 3; i += 1) await send({ userId: 'user-a', locale: 'en' });

  const blocked = await send({ userId: 'user-a', locale: 'en' });
  assert.equal(blocked.statusCode, 429);
  assert.match(blocked.body.message, /transcription limit/);
});

test("one user's usage does not block another user", async () => {
  const { send } = makeHarness();
  for (let i = 0; i < 4; i += 1) await send({ userId: 'user-a' });

  const res = await send({ userId: 'user-b' });
  assert.equal(res.statusCode, 200);
});

test('invalid uploads return 400 and do not consume the allowance', async () => {
  const { calls, send } = makeHarness();

  const invalidFiles = [
    null,
    { buffer: Buffer.alloc(0), mimetype: 'image/png' },
    { buffer: PNG_BUFFER, mimetype: 'application/pdf' },
    { buffer: Buffer.from('not an image at all'), mimetype: 'image/png' },
  ];
  for (let i = 0; i < 5; i += 1) {
    const res = await send({ userId: 'user-a', file: invalidFiles[i % invalidFiles.length] });
    assert.equal(res.statusCode, 400);
  }

  for (let i = 0; i < 3; i += 1) {
    const res = await send({ userId: 'user-a' });
    assert.equal(res.statusCode, 200);
  }
  assert.equal(calls.transcriber, 3);
});

test('a database error fails closed: 429 and no model call', async () => {
  const { calls, send } = makeHarness();
  const brokenDb = {
    query: async () => {
      throw new Error('db down');
    },
  };

  const res = await send({ userId: 'user-a', dbOverride: brokenDb });
  assert.equal(res.statusCode, 429);
  assert.equal(calls.transcriber, 0);
});

test('the allowance returns once 24 hours have passed', async (t) => {
  t.after(() => mock.timers.reset());
  mock.timers.enable({ apis: ['Date'], now: T0 });
  const { send } = makeHarness();

  for (let i = 0; i < 3; i += 1) await send({ userId: 'user-a' });
  assert.equal((await send({ userId: 'user-a' })).statusCode, 429);

  mock.timers.setTime(T0.getTime() + DAY_MS + 1000);
  assert.equal((await send({ userId: 'user-a' })).statusCode, 200);
});
