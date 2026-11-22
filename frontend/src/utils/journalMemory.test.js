import { afterEach, describe, expect, test, vi } from 'vitest';
import {
  journalMemoryPath,
  readMemorySeenDate,
  snapMemoryIndex,
  writeMemorySeenDate,
} from './journalMemory.js';

describe('journal memory seen date', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('round-trips the date the memory was last opened', () => {
    expect(readMemorySeenDate()).toBeNull();
    writeMemorySeenDate('2026-11-19');
    expect(readMemorySeenDate()).toBe('2026-11-19');
  });

  test('blocked storage reads as never seen and writing does not throw', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(readMemorySeenDate()).toBeNull();
    expect(() => writeMemorySeenDate('2026-11-19')).not.toThrow();
  });
});

describe('snapMemoryIndex', () => {
  test('a long swipe left moves to the next card and right to the previous', () => {
    expect(snapMemoryIndex({ index: 0, count: 3, drag: -60 })).toBe(1);
    expect(snapMemoryIndex({ index: 2, count: 3, drag: 60 })).toBe(1);
  });

  test('a short drag snaps back to the same card', () => {
    expect(snapMemoryIndex({ index: 1, count: 3, drag: -39 })).toBe(1);
    expect(snapMemoryIndex({ index: 1, count: 3, drag: 39 })).toBe(1);
  });

  test('never moves past either end', () => {
    expect(snapMemoryIndex({ index: 0, count: 2, drag: 200 })).toBe(0);
    expect(snapMemoryIndex({ index: 1, count: 2, drag: -200 })).toBe(1);
    expect(snapMemoryIndex({ index: 0, count: 1, drag: -200 })).toBe(0);
  });
});

describe('journalMemoryPath', () => {
  test('forwards the page ?date override only when allowed', () => {
    expect(journalMemoryPath('?date=2027-11-19', true)).toBe(
      '/auth/me/journal-memory?date=2027-11-19',
    );
    expect(journalMemoryPath('?date=2027-11-19', false)).toBe('/auth/me/journal-memory');
    expect(journalMemoryPath('', true)).toBe('/auth/me/journal-memory');
  });

  test('encodes the override so it cannot add other query params', () => {
    expect(journalMemoryPath('?date=2027-11-19%26x%3D1', true)).toBe(
      '/auth/me/journal-memory?date=2027-11-19%26x%3D1',
    );
  });
});
