import { describe, expect, test } from 'vitest';
import { resolveSummaryAvailability } from './summaryAvailability.js';

const basePayload = {
  weekStart: '2026-08-03',
  weekEnd: '2026-08-09',
  entryCount: 3,
  minEntries: 2,
  window: {
    open: true,
    enforced: true,
    opensAt: '2026-08-09T10:00:00.000Z',
    closesAt: '2026-08-09T16:00:00.000Z',
  },
  summary: null,
};

describe('resolveSummaryAvailability', () => {
  test('allows create when window is open, enough entries, and no summary', () => {
    const result = resolveSummaryAvailability(basePayload);
    expect(result.canCreate).toBe(true);
    expect(result.displayedSummary).toBeNull();
  });

  test('hides stale summary created before the current window opens', () => {
    const result = resolveSummaryAvailability({
      ...basePayload,
      summary: {
        summaryText: 'Old mid-week summary',
        createdAt: '2026-08-04T15:00:00.000Z',
      },
    });
    expect(result.stale).toBe(true);
    expect(result.displayedSummary).toBeNull();
    expect(result.canCreate).toBe(true);
  });

  test('keeps a summary created during the current window', () => {
    const summary = {
      summaryText: 'Fresh Sunday summary',
      createdAt: '2026-08-09T11:00:00.000Z',
    };
    const result = resolveSummaryAvailability({
      ...basePayload,
      summary,
    });
    expect(result.stale).toBe(false);
    expect(result.displayedSummary).toEqual(summary);
    expect(result.canCreate).toBe(false);
  });

  test('shows existing summary outside the window without create CTA', () => {
    const summary = {
      summaryText: 'Last Sunday summary',
      createdAt: '2026-08-02T12:00:00.000Z',
    };
    const result = resolveSummaryAvailability({
      ...basePayload,
      window: {
        ...basePayload.window,
        open: false,
      },
      summary,
    });
    expect(result.canCreate).toBe(false);
    expect(result.displayedSummary).toEqual(summary);
  });

  test('blocks create when there are too few entries', () => {
    const result = resolveSummaryAvailability({
      ...basePayload,
      entryCount: 1,
    });
    expect(result.canCreate).toBe(false);
  });
});
