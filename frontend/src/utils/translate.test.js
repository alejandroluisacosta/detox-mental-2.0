import { describe, expect, test } from 'vitest';
import { catalogs } from '../data/locales/catalogs.js';
import { translate, translateTopic } from './translate.js';

describe('translate', () => {
  test('returns English copy by default and interpolates values', () => {
    expect(translate('en', 'journal.prompt')).toBe("What's on your mind?");
    expect(translate('en', 'summary.needEntries', {
      minEntries: 2,
      entryCount: 1,
    })).toContain('2');
  });

  test('returns Spanish copy for es', () => {
    expect(translate('es', 'journal.prompt')).toBe('¿Qué tienes en mente?');
  });

  test('falls back to English when a key is missing', () => {
    expect(translate('es', 'missing.key')).toBe('missing.key');
  });
});

describe('translateTopic', () => {
  test('keeps stored Spanish identifiers and shows localized labels', () => {
    expect(translateTopic('en', 'Trabajo')).toBe('Work');
    expect(translateTopic('es', 'Trabajo')).toBe('Trabajo');
    expect(translateTopic('en', 'Unknown')).toBe('Unknown');
  });
});

describe('catalogs', () => {
  test('English and Spanish catalogs share the same keys', () => {
    expect(Object.keys(catalogs.en).sort()).toEqual(Object.keys(catalogs.es).sort());
  });
});
