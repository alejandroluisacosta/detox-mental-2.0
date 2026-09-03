import { describe, expect, test } from 'vitest';
import { resolveSummaryAvailability } from './summaryAvailability.js';

const basePayload = {
  weekStart: '2026-08-03',
  weekEnd: '2026-08-09',
  entryCount: 3,
  minEntries: 2,
  quota: {
    timezone: 'Europe/Madrid',
    limit: 2,
    used: 0,
    remaining: 2,
    resetsAt: '2026-08-09T22:00:00.000Z',
  },
  summary: null,
};

describe('resolveSummaryAvailability', () => {
  test('allows create when there is quota left, enough entries, and no summary', () => {
    const result = resolveSummaryAvailability(basePayload);
    expect(result.canCreate).toBe(true);
    expect(result.canRegenerate).toBe(false);
    expect(result.displayedSummary).toBeNull();
    expect(result.remaining).toBe(2);
  });

  test('allows regenerate when a summary exists and quota remains', () => {
    const summary = {
      summaryText: 'This week’s summary',
      createdAt: '2026-08-04T15:00:00.000Z',
      generationCount: 1,
    };
    const result = resolveSummaryAvailability({
      ...basePayload,
      quota: {
        ...basePayload.quota,
        used: 1,
        remaining: 1,
      },
      summary,
    });
    expect(result.canCreate).toBe(false);
    expect(result.canRegenerate).toBe(true);
    expect(result.displayedSummary).toEqual(summary);
    expect(result.remaining).toBe(1);
  });

  test('blocks create and regenerate when the weekly quota is spent', () => {
    const summary = {
      summaryText: 'This week’s summary',
      createdAt: '2026-08-06T12:00:00.000Z',
      generationCount: 2,
    };
    const result = resolveSummaryAvailability({
      ...basePayload,
      quota: {
        ...basePayload.quota,
        used: 2,
        remaining: 0,
      },
      summary,
    });
    expect(result.canCreate).toBe(false);
    expect(result.canRegenerate).toBe(false);
    expect(result.displayedSummary).toEqual(summary);
    expect(result.remaining).toBe(0);
  });

  test('blocks create when there are too few entries', () => {
    const result = resolveSummaryAvailability({
      ...basePayload,
      entryCount: 1,
    });
    expect(result.canCreate).toBe(false);
    expect(result.canRegenerate).toBe(false);
  });
});
