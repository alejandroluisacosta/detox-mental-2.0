import { describe, expect, test } from 'vitest';
import {
  getSummaryTaskStatuses,
  isAbortError,
  isGenerateRateLimited,
  shouldRetryGenerate,
  SUMMARY_RITUAL_MS,
  SUMMARY_TASK_DURATIONS_MS,
} from './journalSummaryGenerate.js';

describe('journal summary generate helpers', () => {
  test('retries abort, 502, and 504 only', () => {
    expect(shouldRetryGenerate(null, { name: 'AbortError' })).toBe(true);
    expect(shouldRetryGenerate(502, null)).toBe(true);
    expect(shouldRetryGenerate(504, null)).toBe(true);
    expect(shouldRetryGenerate(422, null)).toBe(false);
    expect(shouldRetryGenerate(429, null)).toBe(false);
    expect(shouldRetryGenerate(503, null)).toBe(false);
  });

  test('detects abort and rate-limit payloads', () => {
    expect(isAbortError({ name: 'AbortError' })).toBe(true);
    expect(isGenerateRateLimited(429, { code: 'summary_rate_limited' })).toBe(
      true,
    );
    expect(isGenerateRateLimited(429, { message: 'quota' })).toBe(false);
  });

  test('task durations cover the ritual window', () => {
    expect(
      SUMMARY_TASK_DURATIONS_MS.reduce((sum, ms) => sum + ms, 0),
    ).toBe(SUMMARY_RITUAL_MS);
  });

  test('derives pending, active, and completed statuses from elapsed time', () => {
    expect(getSummaryTaskStatuses(0)).toEqual([
      'active',
      'pending',
      'pending',
      'pending',
    ]);
    expect(getSummaryTaskStatuses(15000)).toEqual([
      'completed',
      'active',
      'pending',
      'pending',
    ]);
    expect(getSummaryTaskStatuses(20000)).toEqual([
      'completed',
      'completed',
      'active',
      'pending',
    ]);
    expect(getSummaryTaskStatuses(25000)).toEqual([
      'completed',
      'completed',
      'completed',
      'active',
    ]);
    expect(
      getSummaryTaskStatuses(30000, { ready: false, minElapsed: true }),
    ).toEqual(['completed', 'completed', 'completed', 'active']);
    expect(
      getSummaryTaskStatuses(30000, { ready: true, minElapsed: true }),
    ).toEqual(['completed', 'completed', 'completed', 'completed']);
  });
});
