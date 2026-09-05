import { describe, expect, test } from 'vitest';
import { getDemoSummaryPayload } from './demoJournal.js';

const wordCount = (text) => text.trim().split(/\s+/).filter(Boolean).length;

describe('demo weekly summaries', () => {
  test('English and Spanish summary bodies are 400–600 words', () => {
    const en = wordCount(getDemoSummaryPayload('en').summary.summaryText);
    const es = wordCount(getDemoSummaryPayload('es').summary.summaryText);
    expect(en).toBeGreaterThanOrEqual(400);
    expect(en).toBeLessThanOrEqual(600);
    expect(es).toBeGreaterThanOrEqual(400);
    expect(es).toBeLessThanOrEqual(600);
  });
});
