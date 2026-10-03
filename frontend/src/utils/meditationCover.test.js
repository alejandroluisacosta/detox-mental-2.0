import { describe, expect, test } from 'vitest';
import { formatLocaleDate } from './locale.js';
import {
  meditationCoverAuthor,
  meditationCoverTitle,
  meditationCoverYearSpan,
} from './meditationCover.js';

const meditationEntry = (overrides) => ({
  topics: ['meditations'],
  createdAt: '2026-06-15T12:00:00.000Z',
  ...overrides,
});

describe('meditationCoverTitle', () => {
  test('uses fallback while the title still uses the default flag', () => {
    expect(meditationCoverTitle('', 'Meditations', true)).toBe('Meditations');
    expect(meditationCoverTitle('   ', 'Meditations', true)).toBe('Meditations');
  });

  test('returns trimmed custom title or empty when the default flag is off', () => {
    expect(meditationCoverTitle('  My Book  ', 'Meditations', false)).toBe('My Book');
    expect(meditationCoverTitle('', 'Meditations', false)).toBe('');
    expect(meditationCoverTitle('   ', 'Meditations', false)).toBe('');
  });
});

describe('meditationCoverAuthor', () => {
  test('returns null for blank values', () => {
    expect(meditationCoverAuthor('')).toBeNull();
    expect(meditationCoverAuthor('  ')).toBeNull();
  });

  test('returns trimmed name', () => {
    expect(meditationCoverAuthor('  Ada  ')).toBe('Ada');
  });
});

describe('meditationCoverYearSpan', () => {
  test('orders by print order (oldest first) even when input is newest first', () => {
    const span = meditationCoverYearSpan(
      [
        meditationEntry({ createdAt: '2026-06-15T12:00:00.000Z' }),
        meditationEntry({ createdAt: '2024-06-15T12:00:00.000Z' }),
      ],
      'en',
    );
    expect(span).toEqual({ start: 2024, end: 2026 });
  });

  test('collapses a single year', () => {
    const span = meditationCoverYearSpan(
      [
        meditationEntry({ createdAt: '2026-06-15T12:00:00.000Z' }),
        meditationEntry({ createdAt: '2026-08-01T12:00:00.000Z' }),
      ],
      'en',
    );
    expect(span).toEqual({ start: 2026, end: 2026 });
  });

  test('ignores non-meditation entries and invalid dates', () => {
    expect(
      meditationCoverYearSpan(
        [{ topics: ['work'], createdAt: '2024-06-15T12:00:00.000Z' }],
        'en',
      ),
    ).toBeNull();
    expect(
      meditationCoverYearSpan([meditationEntry({ createdAt: 'not-a-date' })], 'en'),
    ).toBeNull();
  });

  test('uses one valid year when mixed with invalid dates', () => {
    const span = meditationCoverYearSpan(
      [
        meditationEntry({ createdAt: 'bad' }),
        meditationEntry({ createdAt: '2025-06-15T12:00:00.000Z' }),
      ],
      'en',
    );
    expect(span).toEqual({ start: 2025, end: 2025 });
  });

  test('matches local calendar year from formatLocaleDate', () => {
    const iso = '2024-01-01T00:30:00.000Z';
    const span = meditationCoverYearSpan([meditationEntry({ createdAt: iso })], 'en');
    const fromFormat = Number(formatLocaleDate(iso, 'en', { year: 'numeric' }));
    expect(span?.start).toBe(fromFormat);
    expect(fromFormat).toBe(new Date(iso).getFullYear());
  });
});
