import { describe, expect, test } from 'vitest';
import {
  isAbortError,
  isGenerateRateLimited,
  shouldRetryGenerate,
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
});
