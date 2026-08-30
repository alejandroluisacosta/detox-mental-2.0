import { describe, expect, test } from 'vitest';
import { normalizeTopicName, validateTopicName } from './journalTopicName.js';

describe('normalizeTopicName', () => {
  test('trims and collapses whitespace', () => {
    expect(normalizeTopicName('  Family   life  ')).toBe('Family life');
  });

  test('returns an empty string for non-strings', () => {
    expect(normalizeTopicName(null)).toBe('');
  });
});

describe('validateTopicName', () => {
  test('accepts a valid custom name', () => {
    expect(validateTopicName({ name: ' Family ' })).toEqual({
      valid: true,
      name: 'Family',
    });
  });

  test('rejects empty names', () => {
    expect(validateTopicName({ name: '   ' })).toEqual({
      valid: false,
      messageKey: 'journal.topicNameRequired',
    });
  });

  test('rejects names that are too long', () => {
    expect(validateTopicName({ name: 'This name is far too long!!' })).toEqual({
      valid: false,
      messageKey: 'journal.topicNameTooLong',
    });
  });

  test('rejects reserved slugs and localized labels', () => {
    expect(validateTopicName({ name: 'Work' }).messageKey).toBe(
      'journal.topicNameReserved',
    );
    expect(validateTopicName({ name: 'Trabajo' }).messageKey).toBe(
      'journal.topicNameReserved',
    );
  });

  test('rejects a case-insensitive duplicate among existing names', () => {
    expect(
      validateTopicName({ name: 'family', existingNames: ['Family'] }),
    ).toEqual({
      valid: false,
      messageKey: 'journal.topicNameDuplicate',
    });
  });
});
