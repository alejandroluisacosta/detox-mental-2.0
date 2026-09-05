import { describe, expect, test } from 'vitest';
import {
  getSummaryLoadingQuotes,
  pickDistinctQuotes,
  quoteDisplayMs,
} from './summaryLoadingQuotes.js';

describe('summary loading quotes', () => {
  test('English and Spanish pools have eleven quotes', () => {
    expect(getSummaryLoadingQuotes('en')).toHaveLength(11);
    expect(getSummaryLoadingQuotes('es')).toHaveLength(11);
  });

  test('pickDistinctQuotes returns three unique quotes', () => {
    let i = 0;
    const random = () => {
      i += 1;
      return (i % 10) / 10;
    };
    const picked = pickDistinctQuotes('en', 3, random);
    expect(picked).toHaveLength(3);
    expect(new Set(picked).size).toBe(3);
    picked.forEach((quote) => {
      expect(getSummaryLoadingQuotes('en')).toContain(quote);
    });
  });

  test('quoteDisplayMs is clamped between 3.5s and 8s', () => {
    expect(quoteDisplayMs('x')).toBe(3500);
    expect(quoteDisplayMs('a'.repeat(200))).toBe(8000);
    expect(quoteDisplayMs('a'.repeat(80))).toBe(4800);
  });
});
