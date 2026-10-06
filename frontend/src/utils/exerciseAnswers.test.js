import { describe, expect, test } from 'vitest';
import { answersMatch, normalizeAnswer } from './exerciseAnswers.js';

describe('normalizeAnswer', () => {
  test('strips case, accents, and extra spaces so locale answers can differ in form', () => {
    expect(normalizeAnswer('  Aristóteles  ')).toBe('ARISTOTELES');
    expect(normalizeAnswer('tales de mileto')).toBe('TALES DE MILETO');
  });
});

describe('answersMatch', () => {
  test('accepts any listed answer for the active locale', () => {
    expect(answersMatch(['DESCARTES', 'RENE DESCARTES'], 'Descartes')).toBe(true);
    expect(answersMatch(['DESCARTES', 'RENE DESCARTES'], 'Rene Descartes')).toBe(true);
  });

  test('keeps the current Spanish exact answers working', () => {
    expect(answersMatch(['ARISTÓTELES'], 'ARISTÓTELES')).toBe(true);
    expect(answersMatch(['TALES DE MILETO'], 'TALES DE MILETO')).toBe(true);
    expect(answersMatch(['SOCRATES'], 'SOCRATES')).toBe(true);
  });

  test('rejects a wrong answer', () => {
    expect(answersMatch(['DESCARTES'], 'FREUD')).toBe(false);
  });

  test('treats a single string as one accepted answer', () => {
    expect(answersMatch('FREUD', 'freud')).toBe(true);
  });
});
