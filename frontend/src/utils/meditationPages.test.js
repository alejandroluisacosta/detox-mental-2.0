import { beforeEach, describe, expect, test } from 'vitest';
import {
  MEDITATION_GOAL_STORAGE_KEY,
  MEDITATION_GOALS,
  countWords,
  entriesRemaining,
  formatPagesRemaining,
  pagesRemaining,
  readMeditationProgressGoal,
  writeMeditationProgressGoal,
} from './meditationPages.js';

const word = (n) => Array.from({ length: n }, () => 'word').join(' ');

describe('countWords', () => {
  test('treats blank, whitespace-only, and non-string text as zero words', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('   \n\t  ')).toBe(0);
    expect(countWords(null)).toBe(0);
    expect(countWords(undefined)).toBe(0);
    expect(countWords(42)).toBe(0);
  });

  test('does not count repeated spaces as empty words', () => {
    expect(countWords('one   two')).toBe(2);
  });

  test('keeps punctuation attached to its word', () => {
    expect(countWords('plan.')).toBe(1);
  });
});

describe('pagesRemaining', () => {
  test('returns 24 when there are no entries', () => {
    expect(pagesRemaining([])).toBe(24);
    expect(pagesRemaining(undefined)).toBe(24);
  });

  test('returns 23 after exactly 250 words', () => {
    expect(pagesRemaining([{ content: word(250) }])).toBe(23);
  });

  test('returns 0 at 6,000 words and stays 0 with one more word', () => {
    expect(pagesRemaining([{ content: word(6000) }])).toBe(0);
    expect(pagesRemaining([{ content: word(6001) }])).toBe(0);
  });

  test('returns 0.1 for 5,999 words instead of rounding to zero', () => {
    expect(pagesRemaining([{ content: word(5999) }])).toBe(0.1);
  });
});

describe('formatPagesRemaining', () => {
  test('formats one decimal with a comma in Spanish', () => {
    expect(formatPagesRemaining(23.9, 'es')).toBe('23,9');
  });
});

describe('entriesRemaining', () => {
  test('returns the full target when there are no entries', () => {
    expect(entriesRemaining([], 25)).toBe(25);
    expect(entriesRemaining(undefined, 50)).toBe(50);
  });

  test('never returns negative values once the target is met', () => {
    const entries = Array.from({ length: 30 }, (_, i) => ({ id: String(i) }));
    expect(entriesRemaining(entries, 25)).toBe(0);
    expect(entriesRemaining(entries, 30)).toBe(0);
    expect(entriesRemaining(entries, 50)).toBe(20);
  });
});

describe('meditation progress goal storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('defaults to the book goal when nothing is stored', () => {
    expect(readMeditationProgressGoal()).toBe(MEDITATION_GOALS.BOOK);
  });

  test('persists and reads a valid goal', () => {
    writeMeditationProgressGoal(MEDITATION_GOALS.ENTRIES_50);
    expect(window.localStorage.getItem(MEDITATION_GOAL_STORAGE_KEY)).toBe(MEDITATION_GOALS.ENTRIES_50);
    expect(readMeditationProgressGoal()).toBe(MEDITATION_GOALS.ENTRIES_50);
  });

  test('ignores invalid stored values', () => {
    window.localStorage.setItem(MEDITATION_GOAL_STORAGE_KEY, 'not-a-goal');
    expect(readMeditationProgressGoal()).toBe(MEDITATION_GOALS.BOOK);
  });
});
