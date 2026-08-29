import { test } from 'node:test';
import assert from 'node:assert/strict';
import { localeFromRequest, parseLocale } from './locale.js';

test('parseLocale accepts en and es and falls back to English', () => {
  assert.equal(parseLocale('en'), 'en');
  assert.equal(parseLocale('es'), 'es');
  assert.equal(parseLocale('es-ES,en;q=0.8'), 'es');
  assert.equal(parseLocale('fr'), 'en');
  assert.equal(parseLocale(''), 'en');
  assert.equal(parseLocale(undefined), 'en');
});

test('localeFromRequest reads Accept-Language', () => {
  assert.equal(
    localeFromRequest({
      get: () => 'es',
      headers: {},
    }),
    'es',
  );
  assert.equal(
    localeFromRequest({
      headers: { 'accept-language': 'en-US' },
    }),
    'en',
  );
});
