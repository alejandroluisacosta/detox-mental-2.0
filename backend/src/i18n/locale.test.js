import { test } from 'node:test';
import assert from 'node:assert/strict';
import { localeFromRequest, parseLocale, pickLocalized } from './locale.js';

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

test('localeFromRequest prefers body.locale over Accept-Language', () => {
  assert.equal(
    localeFromRequest({
      body: { locale: 'es' },
      get: () => 'en',
      headers: { 'accept-language': 'en' },
    }),
    'es',
  );
  assert.equal(
    localeFromRequest({
      body: { locale: 'en-US' },
      headers: { 'accept-language': 'es' },
    }),
    'en',
  );
});

test('localeFromRequest falls back to Accept-Language when body locale is missing', () => {
  assert.equal(
    localeFromRequest({
      body: { message: 'hola' },
      headers: { 'accept-language': 'es-ES' },
    }),
    'es',
  );
});

test('localeFromRequest treats unsupported body locale as English', () => {
  assert.equal(
    localeFromRequest({
      body: { locale: 'fr' },
      headers: { 'accept-language': 'es' },
    }),
    'en',
  );
});

test('pickLocalized returns the requested locale and falls back to Spanish', () => {
  const copy = { es: 'Hola', en: 'Hello' };
  assert.equal(pickLocalized(copy, 'es'), 'Hola');
  assert.equal(pickLocalized(copy, 'en'), 'Hello');
  assert.equal(pickLocalized({ es: 'Hola' }, 'en'), 'Hola');
  assert.equal(pickLocalized('already a string', 'en'), 'already a string');
});
