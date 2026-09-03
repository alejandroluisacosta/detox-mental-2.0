import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildQuotaPayload,
  getWeekBounds,
  getZonedParts,
  SUMMARY_GENERATIONS_PER_WEEK,
  zonedLocalToUtc,
} from './summaryWeek.js';

test('zonedLocalToUtc maps Madrid winter noon to 11:00 UTC', () => {
  // 2026-01-11 is Sunday; CET = UTC+1
  const utc = zonedLocalToUtc(2026, 1, 11, 12, 0, 0, 'Europe/Madrid');
  assert.equal(utc.toISOString(), '2026-01-11T11:00:00.000Z');
});

test('zonedLocalToUtc maps Madrid summer noon to 10:00 UTC', () => {
  // 2026-07-05 is Sunday; CEST = UTC+2
  const utc = zonedLocalToUtc(2026, 7, 5, 12, 0, 0, 'Europe/Madrid');
  assert.equal(utc.toISOString(), '2026-07-05T10:00:00.000Z');
});

test('getWeekBounds returns Monday–Sunday for a mid-week instant', () => {
  // Wednesday 2026-07-29 15:00 Madrid = 13:00 UTC
  const now = new Date('2026-07-29T13:00:00.000Z');
  const bounds = getWeekBounds(now, 'Europe/Madrid');
  assert.equal(bounds.weekStart, '2026-07-27');
  assert.equal(bounds.weekEnd, '2026-08-02');
  assert.equal(bounds.periodStart.toISOString(), '2026-07-26T22:00:00.000Z');
  assert.equal(bounds.periodEnd.toISOString(), '2026-08-02T22:00:00.000Z');
});

test('getZonedParts reports Monday at week reset in Madrid', () => {
  const mondayMidnight = new Date('2026-08-02T22:00:00.000Z');
  const parts = getZonedParts(mondayMidnight, 'Europe/Madrid');
  assert.equal(parts.weekday, 'Mon');
  assert.equal(parts.hour, 0);
});

test('buildQuotaPayload reports remaining generations and next Monday reset', () => {
  const now = new Date('2026-07-29T13:00:00.000Z');
  const unused = buildQuotaPayload(0, now, 'Europe/Madrid');
  assert.equal(unused.limit, SUMMARY_GENERATIONS_PER_WEEK);
  assert.equal(unused.used, 0);
  assert.equal(unused.remaining, 2);
  assert.equal(unused.timezone, 'Europe/Madrid');
  assert.equal(unused.resetsAt, '2026-08-02T22:00:00.000Z');

  const oneUsed = buildQuotaPayload(1, now, 'Europe/Madrid');
  assert.equal(oneUsed.remaining, 1);

  const exhausted = buildQuotaPayload(2, now, 'Europe/Madrid');
  assert.equal(exhausted.remaining, 0);

  const overLimit = buildQuotaPayload(5, now, 'Europe/Madrid');
  assert.equal(overLimit.remaining, 0);
});
