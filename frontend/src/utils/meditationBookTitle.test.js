import { describe, expect, test } from 'vitest';
import {
  bookTitleFieldIsDirty,
  bookTitleForField,
  bookTitlePatchFromDraft,
} from './meditationBookTitle.js';

const matter = (overrides) => ({
  title: '',
  authorName: '',
  introduction: '',
  titleUsesDefault: true,
  ...overrides,
});

describe('bookTitleForField', () => {
  test('shows the default title until a custom title is saved', () => {
    expect(bookTitleForField(matter(), 'Meditations')).toBe('Meditations');
    expect(
      bookTitleForField(matter({ title: '', titleUsesDefault: false }), 'Meditations'),
    ).toBe('');
    expect(
      bookTitleForField(matter({ title: 'Quiet', titleUsesDefault: false }), 'Meditations'),
    ).toBe('Quiet');
  });
});

describe('bookTitleFieldIsDirty', () => {
  test('treats the default label as clean before the title is stored', () => {
    expect(bookTitleFieldIsDirty('Meditations', matter(), 'Meditations')).toBe(false);
    expect(bookTitleFieldIsDirty('Meditations ', matter(), 'Meditations')).toBe(false);
  });

  test('detects edits and clearing away from the saved value', () => {
    expect(bookTitleFieldIsDirty('New', matter(), 'Meditations')).toBe(true);
    expect(bookTitleFieldIsDirty('', matter(), 'Meditations')).toBe(true);
    expect(
      bookTitleFieldIsDirty('Meditations', matter({ title: '', titleUsesDefault: false }), 'Meditations'),
    ).toBe(true);
    expect(
      bookTitleFieldIsDirty('', matter({ title: '', titleUsesDefault: false }), 'Meditations'),
    ).toBe(false);
  });
});

describe('bookTitlePatchFromDraft', () => {
  test('returns null when the draft matches the saved display title', () => {
    expect(bookTitlePatchFromDraft('Meditations', matter(), 'Meditations')).toBeNull();
  });

  test('stores an explicit empty title when the user clears the field', () => {
    expect(bookTitlePatchFromDraft('', matter(), 'Meditations')).toEqual({
      title: '',
      titleUsesDefault: false,
    });
  });
});
