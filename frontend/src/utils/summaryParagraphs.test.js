import { describe, expect, test } from 'vitest';
import {
  splitSummaryParagraphs,
  truncateSummaryQuote,
} from './summaryParagraphs.js';

describe('splitSummaryParagraphs', () => {
  test('splits on blank lines and drops empty pieces', () => {
    expect(
      splitSummaryParagraphs('First insight.\n\nSecond insight.\n\n\nThird.'),
    ).toEqual(['First insight.', 'Second insight.', 'Third.']);
  });

  test('returns a single paragraph when there are no blank lines', () => {
    expect(splitSummaryParagraphs('One block of text.')).toEqual([
      'One block of text.',
    ]);
  });

  test('returns an empty list for blank input', () => {
    expect(splitSummaryParagraphs('')).toEqual([]);
    expect(splitSummaryParagraphs(null)).toEqual([]);
  });
});

describe('truncateSummaryQuote', () => {
  test('leaves short quotes intact and truncates long ones', () => {
    expect(truncateSummaryQuote('Short line')).toBe('Short line');
    expect(truncateSummaryQuote('abcdefghij', 6)).toBe('abcde…');
  });
});
