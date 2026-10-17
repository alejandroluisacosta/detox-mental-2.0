import { test } from 'node:test';
import assert from 'node:assert/strict';
import { consumeRateLimit } from './rateLimit.service.js';
import { memoryRateLimitDb } from './rateLimit.testDb.js';

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const T0 = new Date('2026-10-01T12:00:00.000Z');
const at = (ms) => new Date(T0.getTime() + ms);

const consume = (db, overrides = {}) =>
  consumeRateLimit({
    bucket: 'b',
    subject: 's',
    limits: [{ max: 3, windowMs: 15 * MIN }],
    now: T0,
    db,
    random: () => 1,
    ...overrides,
  });

test('allows up to max calls in the window, then denies', async () => {
  const db = memoryRateLimitDb();
  assert.deepEqual(
    [await consume(db), await consume(db), await consume(db), await consume(db)],
    [true, true, true, false],
  );
});

test('allows again once the window has passed', async () => {
  const db = memoryRateLimitDb();
  for (let i = 0; i < 3; i += 1) await consume(db);
  assert.equal(await consume(db), false);
  assert.equal(await consume(db, { now: at(15 * MIN + 1) }), true);
});

test('a different subject is unaffected', async () => {
  const db = memoryRateLimitDb();
  for (let i = 0; i < 3; i += 1) await consume(db);
  assert.equal(await consume(db, { subject: 'other' }), true);
});

test('a different bucket with the same subject is unaffected', async () => {
  const db = memoryRateLimitDb();
  for (let i = 0; i < 3; i += 1) await consume(db);
  assert.equal(await consume(db, { bucket: 'other' }), true);
});

test('a denied call uses up no budget', async () => {
  const db = memoryRateLimitDb();
  await consume(db, { now: at(0) });
  await consume(db, { now: at(1 * MIN) });
  await consume(db, { now: at(2 * MIN) });
  // Denied attempts late in the window must not extend the block.
  assert.equal(await consume(db, { now: at(10 * MIN) }), false);
  assert.equal(await consume(db, { now: at(14 * MIN) }), false);
  assert.equal(db.rows.length, 3);
  // Once the oldest row ages out, exactly one slot is free.
  assert.equal(await consume(db, { now: at(15 * MIN + 1) }), true);
  assert.equal(await consume(db, { now: at(15 * MIN + 1) }), false);
});

test('the daily window denies even when the short window has room', async () => {
  const db = memoryRateLimitDb();
  const limits = [
    { max: 3, windowMs: 15 * MIN },
    { max: 5, windowMs: 24 * HOUR },
  ];
  // Five calls spaced beyond the short window.
  for (let i = 0; i < 5; i += 1) {
    assert.equal(await consume(db, { limits, now: at(i * 20 * MIN) }), true);
  }
  assert.equal(await consume(db, { limits, now: at(5 * 20 * MIN) }), false);
});

test('purges rows older than a day when the random roll hits', async () => {
  const db = memoryRateLimitDb();
  await consume(db, { now: at(0) });
  await consume(db, { now: at(25 * HOUR), random: () => 0 });
  assert.equal(db.rows.length, 1);
  assert.equal(db.rows[0].created_at.getTime(), at(25 * HOUR).getTime());
});

test('does not purge when the random roll misses', async () => {
  const db = memoryRateLimitDb();
  await consume(db, { now: at(0) });
  await consume(db, { now: at(25 * HOUR), random: () => 0.5 });
  assert.equal(db.rows.length, 2);
});
