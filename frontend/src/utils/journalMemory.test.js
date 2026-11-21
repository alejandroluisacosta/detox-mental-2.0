import { describe, expect, test } from 'vitest';
import {
  isJournalMemorySeen,
  markJournalMemorySeen,
  nextIndexAfterSwipe,
} from './journalMemory.js';

const memoryStorage = () => {
  const data = new Map();
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
  };
};

const brokenStorage = {
  getItem() {
    throw new Error('storage disabled');
  },
  setItem() {
    throw new Error('storage disabled');
  },
};

describe('journal memory seen state', () => {
  test('a memory opened today reads as seen for the rest of today', () => {
    const storage = memoryStorage();
    markJournalMemorySeen('2026-11-21', storage);
    expect(isJournalMemorySeen('2026-11-21', storage)).toBe(true);
  });

  test('the next day the memory is fresh again without any reset', () => {
    const storage = memoryStorage();
    markJournalMemorySeen('2026-11-21', storage);
    expect(isJournalMemorySeen('2026-11-22', storage)).toBe(false);
  });

  test('blocked storage never breaks the page: memories read as fresh', () => {
    expect(() => markJournalMemorySeen('2026-11-21', brokenStorage)).not.toThrow();
    expect(isJournalMemorySeen('2026-11-21', brokenStorage)).toBe(false);
  });
});

describe('nextIndexAfterSwipe', () => {
  test('a long swipe left moves to the next entry', () => {
    expect(nextIndexAfterSwipe(0, -80, 2)).toBe(1);
  });

  test('a long swipe right moves back to the previous entry', () => {
    expect(nextIndexAfterSwipe(1, 80, 2)).toBe(0);
  });

  test('a small drag snaps back to the same entry', () => {
    expect(nextIndexAfterSwipe(0, -20, 2)).toBe(0);
  });

  test('swiping past either end stays on the edge entry', () => {
    expect(nextIndexAfterSwipe(1, -120, 2)).toBe(1);
    expect(nextIndexAfterSwipe(0, 120, 2)).toBe(0);
  });
});
