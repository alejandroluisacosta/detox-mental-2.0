import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  GENERATE_ATTEMPT_KIND,
  MAX_GENERATE_ATTEMPTS_IN_WINDOW,
  MAX_REVISE_ATTEMPTS_IN_WINDOW,
  REVISE_ATTEMPT_KIND,
  countRecentGenerateAttempts,
  countRecentReviseAttempts,
  recordGenerateAttempt,
  recordReviseAttempt,
} from './journalSummaries.service.js';

const memoryDb = () => {
  const rows = [];
  return {
    async query(sql, params) {
      if (/INSERT/.test(sql)) {
        rows.push({ userId: params[0], kind: params[1] });
        return { rows: [] };
      }
      const [, kind] = params;
      const count = rows.filter((row) => row.kind === kind).length;
      return { rows: [{ count }] };
    },
  };
};

test('generate and revise share the same window size so each product call can retry', () => {
  assert.equal(MAX_GENERATE_ATTEMPTS_IN_WINDOW, 3);
  assert.equal(MAX_REVISE_ATTEMPTS_IN_WINDOW, 3);
});

test('a full generate retry window still leaves the revise budget open', async () => {
  const db = memoryDb();
  const now = new Date('2026-09-13T12:00:00.000Z');

  await recordGenerateAttempt('user-1', db);
  await recordGenerateAttempt('user-1', db);
  await recordGenerateAttempt('user-1', db);

  const generateCount = await countRecentGenerateAttempts('user-1', now, db);
  const reviseCount = await countRecentReviseAttempts('user-1', now, db);

  assert.equal(generateCount, MAX_GENERATE_ATTEMPTS_IN_WINDOW);
  assert.equal(reviseCount, 0);
  assert.equal(reviseCount >= MAX_REVISE_ATTEMPTS_IN_WINDOW, false);
});

test('create, revise, regenerate, and revise can all record back to back', async () => {
  const db = memoryDb();
  const now = new Date('2026-09-13T12:00:00.000Z');

  await recordGenerateAttempt('user-1', db);
  await recordReviseAttempt('user-1', db);
  await recordGenerateAttempt('user-1', db);
  await recordReviseAttempt('user-1', db);

  const generateCount = await countRecentGenerateAttempts('user-1', now, db);
  const reviseCount = await countRecentReviseAttempts('user-1', now, db);

  assert.equal(generateCount, 2);
  assert.equal(reviseCount, 2);
  assert.equal(generateCount >= MAX_GENERATE_ATTEMPTS_IN_WINDOW, false);
  assert.equal(reviseCount >= MAX_REVISE_ATTEMPTS_IN_WINDOW, false);
});

test('recording attempts stores generate and revise under different kinds', async () => {
  const seen = [];
  const db = {
    async query(sql, params) {
      seen.push({ sql, params });
      return { rows: [] };
    },
  };

  await recordGenerateAttempt('user-1', db);
  await recordReviseAttempt('user-1', db);

  assert.match(seen[0].sql, /kind/);
  assert.deepEqual(seen[0].params, ['user-1', GENERATE_ATTEMPT_KIND]);
  assert.deepEqual(seen[1].params, ['user-1', REVISE_ATTEMPT_KIND]);
});
