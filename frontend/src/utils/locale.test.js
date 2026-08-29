import { describe, expect, test } from 'vitest';
import {
  DEFAULT_LOCALE,
  interpolate,
  parseLocale,
  readStoredLocale,
  writeStoredLocale,
} from './locale.js';

describe('parseLocale', () => {
  test('accepts supported locales and falls back to English', () => {
    expect(parseLocale('en')).toBe('en');
    expect(parseLocale('es-ES')).toBe('es');
    expect(parseLocale('fr')).toBe(DEFAULT_LOCALE);
    expect(parseLocale(undefined)).toBe(DEFAULT_LOCALE);
  });
});

describe('locale persistence', () => {
  test('stores and reads a supported locale', () => {
    expect(writeStoredLocale('es')).toBe('es');
    expect(readStoredLocale()).toBe('es');
  });

  test('ignores unsupported stored values', () => {
    window.localStorage.setItem('appLocale', 'fr');
    expect(readStoredLocale()).toBe('en');
  });
});

describe('interpolate', () => {
  test('replaces named placeholders', () => {
    expect(interpolate('Need {minEntries} of {entryCount}', {
      minEntries: 2,
      entryCount: 1,
    })).toBe('Need 2 of 1');
  });
});
