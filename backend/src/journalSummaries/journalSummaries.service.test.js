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
  reviseWeeklySummary,
  upsertWeeklySummary,
} from './journalSummaries.service.js';
import { SUMMARY_GENERATIONS_PER_WEEK } from './summaryWeek.js';

const memoryDb = (clock = () => new Date()) => {
  const rows = [];
  return {
    async query(sql, params) {
      if (/INSERT/.test(sql)) {
        rows.push({
          userId: params[0],
          kind: params[1],
          created_at: clock(),
        });
        return { rows: [] };
      }
      const [userId, kind, since] = params;
      const count = rows.filter(
        (row) =>
          row.userId === userId &&
          row.kind === kind &&
          row.created_at >= since,
      ).length;
      return { rows: [{ count }] };
    },
  };
};

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

test('three generate attempts at T still count at T+5min and expire by T+20min', async () => {
  const recordedAt = new Date('2026-09-13T12:00:00.000Z');
  const db = memoryDb(() => recordedAt);

  await recordGenerateAttempt('user-1', db);
  await recordGenerateAttempt('user-1', db);
  await recordGenerateAttempt('user-1', db);

  const plusFiveMinutes = new Date(recordedAt.getTime() + 5 * 60 * 1000);
  const plusTwentyMinutes = new Date(recordedAt.getTime() + 20 * 60 * 1000);

  assert.equal(await countRecentGenerateAttempts('user-1', plusFiveMinutes, db), 3);
  assert.equal(await countRecentGenerateAttempts('user-1', plusTwentyMinutes, db), 0);
});

const summaryQuotaDb = () => {
  const rows = [];
  let nextId = 1;
  const now = new Date('2026-09-13T12:00:00.000Z');

  const applyInsertFields = (row, params) => {
    row.week_end = params[2];
    row.period_start = params[3];
    row.period_end = params[4];
    row.summary_text = params[5];
    row.main_topics = params[6];
    row.best_quote = params[7];
    row.best_quote_entry_id = params[8];
    row.socratic_text = params[9];
    row.machiavelli_text = params[10];
    row.entry_count = params[11];
    row.model_id = params[12];
    row.locale = params[13];
    row.created_at = now;
  };

  return {
    async query(sql, params = []) {
      const text = sql.replace(/\s+/g, ' ');

      if (/INSERT INTO journal_weekly_summaries/.test(text)) {
        const [userId, weekStart] = params;
        const limit = params[14];
        const existing = rows.find(
          (row) => row.user_id === userId && row.week_start === weekStart,
        );
        if (!existing) {
          const row = {
            id: `summary-${nextId}`,
            user_id: userId,
            week_start: weekStart,
            generation_count: 1,
            feedback_count: 0,
          };
          nextId += 1;
          applyInsertFields(row, params);
          rows.push(row);
          return { rows: [row] };
        }
        const enforcesLimit = /generation_count < \$15/.test(text);
        if (enforcesLimit && existing.generation_count >= limit) {
          return { rows: [] };
        }
        existing.generation_count += 1;
        if (/feedback_count = 0/.test(text)) {
          existing.feedback_count = 0;
        }
        applyInsertFields(existing, params);
        return { rows: [existing] };
      }

      if (/UPDATE journal_weekly_summaries/.test(text)) {
        const [userId, weekStart] = params;
        const existing = rows.find(
          (row) => row.user_id === userId && row.week_start === weekStart,
        );
        if (!existing) return { rows: [] };
        if (/feedback_count = 0/.test(text) && existing.feedback_count !== 0) {
          return { rows: [] };
        }
        existing.summary_text = params[2];
        existing.main_topics = params[3];
        existing.best_quote = params[4];
        existing.best_quote_entry_id = params[5];
        existing.socratic_text = params[6];
        existing.machiavelli_text = params[7];
        existing.entry_count = params[8];
        existing.model_id = params[9];
        existing.locale = params[10];
        existing.feedback_count = 1;
        existing.created_at = now;
        return { rows: [existing] };
      }

      return { rows: [] };
    },
  };
};

const summaryFields = (summaryText) => ({
  userId: 'user-1',
  weekStart: '2026-09-07',
  weekEnd: '2026-09-13',
  periodStart: '2026-09-07T00:00:00.000Z',
  periodEnd: '2026-09-14T00:00:00.000Z',
  summaryText,
  mainTopics: ['work'],
  bestQuote: 'quote',
  bestQuoteEntryId: 'entry-1',
  socraticText: 'socratic',
  machiavelliText: 'machiavelli',
  entryCount: 1,
  modelId: 'model',
  locale: 'en',
  limit: SUMMARY_GENERATIONS_PER_WEEK,
});

test('the third weekly generate returns null once the quota is spent', async () => {
  const db = summaryQuotaDb();
  const first = await upsertWeeklySummary(summaryFields('one'), db);
  const second = await upsertWeeklySummary(summaryFields('two'), db);
  const third = await upsertWeeklySummary(summaryFields('three'), db);

  assert.equal(first.generationCount, 1);
  assert.equal(second.generationCount, 2);
  assert.equal(third, null);
});

test('a second revise on the same summary returns null', async () => {
  const db = summaryQuotaDb();
  await upsertWeeklySummary(summaryFields('one'), db);

  const first = await reviseWeeklySummary(summaryFields('revised once'), db);
  const second = await reviseWeeklySummary(summaryFields('revised twice'), db);

  assert.equal(first.feedbackCount, 1);
  assert.equal(first.summaryText, 'revised once');
  assert.equal(second, null);
});

test('a fresh generate resets feedback_count to 0', async () => {
  const db = summaryQuotaDb();
  await upsertWeeklySummary(summaryFields('one'), db);
  await reviseWeeklySummary(summaryFields('revised'), db);

  const regenerated = await upsertWeeklySummary(summaryFields('two'), db);
  assert.equal(regenerated.generationCount, 2);
  assert.equal(regenerated.feedbackCount, 0);
  assert.equal(regenerated.summaryText, 'two');
});
