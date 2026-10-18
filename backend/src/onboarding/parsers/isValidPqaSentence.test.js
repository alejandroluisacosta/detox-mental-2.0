import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isValidPqaSentence, MAX_PQA_SENTENCE_LENGTH } from './isValidPqaSentence.js';

test('accepts a short single sentence', () => {
  assert.equal(isValidPqaSentence('Nunca hago nada bien.'), true);
});

test('rejects non-strings and empty input', () => {
  for (const value of [undefined, null, 42, {}, ['a.'], '', '   ']) {
    assert.equal(isValidPqaSentence(value), false);
  }
});

test('rejects multiple sentences', () => {
  assert.equal(isValidPqaSentence('Una frase. Otra frase.'), false);
});

test('accepts the maximum length and rejects one character more', () => {
  assert.equal(isValidPqaSentence('a'.repeat(MAX_PQA_SENTENCE_LENGTH)), true);
  assert.equal(isValidPqaSentence('a'.repeat(MAX_PQA_SENTENCE_LENGTH + 1)), false);
});
