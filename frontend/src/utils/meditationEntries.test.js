import { describe, expect, test } from 'vitest';
import {
  MEDITATIONS_TOPIC,
  filterMeditationEntriesNewestFirst,
  meditationEntriesForPrint,
  meditationPrintWordCount,
} from './meditationEntries.js';

describe('filterMeditationEntriesNewestFirst', () => {
  test('keeps only meditations-tagged entries and sorts newest first', () => {
    const entries = [
      { id: 'a', topics: ['meditations'], createdAt: '2026-01-01T00:00:00.000Z', content: 'old' },
      { id: 'b', topics: ['private'], createdAt: '2026-02-01T00:00:00.000Z', content: 'skip' },
      { id: 'c', topics: ['meditations'], createdAt: '2026-03-01T00:00:00.000Z', content: 'new' },
    ];

    const result = filterMeditationEntriesNewestFirst(entries);
    expect(result.map((e) => e.id)).toEqual(['c', 'a']);
  });
});

describe('meditationEntriesForPrint', () => {
  test('sorts meditations entries oldest first for print', () => {
    const entries = [
      { id: 'new', topics: ['meditations'], createdAt: '2026-08-02T12:00:00.000Z' },
      { id: 'old', topics: ['meditations'], createdAt: '2026-08-01T12:00:00.000Z' },
    ];

    expect(meditationEntriesForPrint(entries).map((e) => e.id)).toEqual(['old', 'new']);
  });

  test('filters non-meditation topics like the live feed', () => {
    const entries = [
      { id: 'keep', topics: ['meditations'], createdAt: '2026-08-01T12:00:00.000Z' },
      { id: 'drop', topics: ['journal'], createdAt: '2026-07-01T12:00:00.000Z' },
    ];

    expect(meditationEntriesForPrint(entries).map((e) => e.id)).toEqual(['keep']);
  });
});

describe('meditationPrintWordCount', () => {
  test('sums words across printable entries', () => {
    const entries = [
      { topics: [MEDITATIONS_TOPIC], content: 'one two', createdAt: '2026-01-01T00:00:00.000Z' },
      { topics: [MEDITATIONS_TOPIC], content: 'three', createdAt: '2026-02-01T00:00:00.000Z' },
    ];
    expect(meditationPrintWordCount(entries)).toBe(3);
  });
});
