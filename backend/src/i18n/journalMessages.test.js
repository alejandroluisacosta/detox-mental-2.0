import { test } from 'node:test';
import assert from 'node:assert/strict';
import { journalMessage } from './journalMessages.js';

test('returns English journal errors by default', () => {
  assert.equal(journalMessage('en', 'emptyContent'), 'Journal text cannot be empty.');
  assert.equal(
    journalMessage('de', 'saveFailed'),
    'Could not save the entry.',
  );
});

test('returns Spanish journal errors and interpolates counts', () => {
  assert.equal(
    journalMessage('es', 'needEntries', { minEntries: 2 }),
    'Necesitas al menos 2 entradas esta semana para crear el resumen.',
  );
  assert.equal(
    journalMessage('es', 'tooManyTopics', { max: 3 }),
    'Puedes seleccionar hasta 3 temas por entrada.',
  );
});
