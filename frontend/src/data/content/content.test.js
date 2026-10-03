import { describe, expect, test } from 'vitest';
import { getSessions, getTests, getTheory } from './index.js';

const SHARED_SESSION_FIELDS = ['id', 'img', 'isBlocked'];

describe('getSessions', () => {
  test('returns the fifteen shared session ids and images for Spanish', () => {
    const sessions = getSessions('es');
    expect(sessions).toHaveLength(15);
    expect(sessions.map((session) => session.id)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
    ]);
    expect(sessions[0].img).toBe('/images/socrates.webp');
    expect(sessions[0].isBlocked).toBe(false);
    expect(sessions[1].isBlocked).toBe(true);
  });

  test('keeps the existing Spanish wording until a locale overlay exists', () => {
    const [first] = getSessions('es');
    expect(first.title).toBe('Tú no eres tu mente');
    expect(first.description).toBe('Y aceptarlo es el primer paso');
    expect(first.exercise.answers).toEqual(['DESCARTES']);
    expect(first.exercise.question).toContain('Pienso, luego existo');
  });

  test('falls back to Spanish copy when English is still a scaffold', () => {
    const [esFirst] = getSessions('es');
    const [enFirst] = getSessions('en');
    expect(enFirst.title).toBe(esFirst.title);
    expect(enFirst.exercise.text).toBe(esFirst.exercise.text);
    expect(enFirst.exercise.answers).toEqual(esFirst.exercise.answers);
    SHARED_SESSION_FIELDS.forEach((field) => {
      expect(enFirst[field]).toBe(esFirst[field]);
    });
  });

  test('exposes exercise answers as an array so English can accept different forms', () => {
    getSessions('es').forEach((session) => {
      expect(Array.isArray(session.exercise.answers)).toBe(true);
      expect(session.exercise.answers.length).toBeGreaterThan(0);
    });
  });
});

describe('getTests', () => {
  test('returns the existing Spanish thought-test catalog', () => {
    const tests = getTests('es');
    expect(tests['stressing-thoughts-1'].title).toBe('Pensamientos estresantes');
    expect(tests['mind-voice'].id).toBe('mind-voice');
    expect(tests['stressing-thoughts-1'].recommendation.byOption.future).toBe(
      'future-thoughts-1',
    );
  });

  test('falls back to Spanish when English tests are untranslated', () => {
    const esTests = getTests('es');
    const enTests = getTests('en');
    expect(Object.keys(enTests).sort()).toEqual(Object.keys(esTests).sort());
    expect(enTests['stressing-thoughts-1'].intro).toBe(
      esTests['stressing-thoughts-1'].intro,
    );
    expect(enTests['mind-voice'].questions[0].options[0].label).toBe(
      esTests['mind-voice'].questions[0].options[0].label,
    );
  });
});

describe('getTheory', () => {
  test('returns the Spanish theory title and body', () => {
    const theory = getTheory('es');
    expect(theory.title).toBe('Cómo limpiar tu mente en 5 pasos');
    expect(theory.subtitle).toContain('estrategia para reducir tu estrés');
    expect(typeof theory.Body).toBe('function');
  });

  test('serves a complete English theory article instead of falling back to Spanish', () => {
    const esTheory = getTheory('es');
    const enTheory = getTheory('en');
    expect(enTheory.title).toBe('How to cleanse your mind in 5 steps');
    expect(enTheory.subtitle).toBe(
      'The strategy for reducing your stress in a simple, safe way',
    );
    expect(enTheory.wantMoreTitle).toBe('Want more?');
    expect(enTheory.writtenBy).toMatch(/Story by: Marco Ferrani/);
    expect(enTheory.Body).not.toBe(esTheory.Body);
    expect(enTheory.WantMore).not.toBe(esTheory.WantMore);
    expect(typeof enTheory.Body).toBe('function');
    expect(typeof enTheory.WantMore).toBe('function');
  });

  test('keeps the Spanish theory article unchanged', () => {
    const theory = getTheory('es');
    expect(theory.title).toBe('Cómo limpiar tu mente en 5 pasos');
    expect(theory.subtitle).toContain('estrategia para reducir tu estrés');
    expect(theory.writtenBy).toBe('Historia por: Marco Ferrani - Detox Mental');
    expect(theory.wantMoreTitle).toBe('¿Quieres más?');
  });
});
