import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ENFORCE_SUMMARY_WINDOW,
  getWeekBounds,
  getZonedParts,
  isSummaryWindowOpen,
  zonedLocalToUtc,
} from './summaryWindow.js';

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
  assert.equal(bounds.opensAt.toISOString(), '2026-08-02T10:00:00.000Z');
  assert.equal(bounds.closesAt.toISOString(), '2026-08-02T16:00:00.000Z');
});

test('getZonedParts reports Sunday in Madrid for window open instant', () => {
  const openInstant = new Date('2026-08-02T10:00:00.000Z');
  const parts = getZonedParts(openInstant, 'Europe/Madrid');
  assert.equal(parts.weekday, 'Sun');
  assert.equal(parts.hour, 12);
});

test('isSummaryWindowOpen respects ENFORCE_SUMMARY_WINDOW', () => {
  const wednesday = new Date('2026-07-29T13:00:00.000Z');
  if (!ENFORCE_SUMMARY_WINDOW) {
    assert.equal(isSummaryWindowOpen(wednesday), true);
  } else {
    assert.equal(isSummaryWindowOpen(wednesday), false);
    const sundayNoon = new Date('2026-08-02T10:30:00.000Z');
    assert.equal(isSummaryWindowOpen(sundayNoon), true);
    const sundayEvening = new Date('2026-08-02T16:00:00.000Z');
    assert.equal(isSummaryWindowOpen(sundayEvening), false);
  }
});
