import { test } from 'node:test';
import assert from 'node:assert/strict';
import { allowChatLlmCall } from './limits.js';
import { memoryRateLimitDb } from './rateLimit.testDb.js';

process.env.MAGIC_LINK_SECRET = 'test-secret';

const MIN = 60 * 1000;
const T0 = new Date('2026-10-01T12:00:00.000Z');
const at = (ms) => new Date(T0.getTime() + ms);

const call = (db, ip, now = T0) => allowChatLlmCall({ ip, now, db });

test('an IP gets 6 calls per hour, then is denied', async () => {
  const db = memoryRateLimitDb();
  const results = [];
  for (let i = 0; i < 7; i += 1) results.push(await call(db, '1.1.1.1'));
  assert.deepEqual(results, [true, true, true, true, true, true, false]);
});

test('an IP gets 10 calls per day even when spaced beyond the hourly window', async () => {
  const db = memoryRateLimitDb();
  const results = [];
  for (let i = 0; i < 11; i += 1) {
    results.push(await call(db, '1.1.1.1', at(i * 70 * MIN)));
  }
  assert.deepEqual(results, [...Array(10).fill(true), false]);
});

test('another IP is unaffected by a denied one', async () => {
  const db = memoryRateLimitDb();
  for (let i = 0; i < 6; i += 1) await call(db, '1.1.1.1');
  assert.equal(await call(db, '1.1.1.1'), false);
  assert.equal(await call(db, '2.2.2.2'), true);
});

test('after 100 global calls over distinct IPs, a fresh IP is denied', async () => {
  const db = memoryRateLimitDb();
  for (let i = 0; i < 100; i += 1) {
    assert.equal(await call(db, `10.0.0.${i}`), true);
  }
  assert.equal(await call(db, '10.9.9.9'), false);
});

test('a call denied on the IP check does not spend global budget', async () => {
  const db = memoryRateLimitDb();
  for (let i = 0; i < 6; i += 1) await call(db, '1.1.1.1');
  for (let i = 0; i < 5; i += 1) await call(db, '1.1.1.1');
  assert.equal(db.rows.filter((r) => r.bucket === 'chat_global').length, 6);
});

test('a database error propagates so callers can fail closed', async () => {
  const db = {
    query: async () => {
      throw new Error('db down');
    },
  };
  await assert.rejects(() => call(db, '1.1.1.1'), /db down/);
});
