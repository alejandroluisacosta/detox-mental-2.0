import { describe, expect, test } from 'vitest';
import { getSessions, getTestExtras, getTests, getTheory } from './index.js';

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

const SPANISH_LEFTOVER = /[¿¡]|Pensamientos|Bienvenido|mismo\/a|incómodo\/a|seguro\/a|padre\/madre|Sócrates|te propongo|Hola de nuevo|\bPQA\b|\bPQAs\b/i;

const userFacingTestStrings = (catalog) =>
  Object.values(catalog).flatMap((entry) => [
    entry.title,
    entry.intro,
    entry.journalingPrompt,
    entry.recommendation?.message,
    entry.coursePromo?.title,
    entry.coursePromo?.paragraph,
    entry.coursePromo?.buttonLabel,
    ...entry.questions.flatMap((question) => [
      question.prompt,
      ...question.options.map((option) => option.label),
    ]),
  ]).filter((value) => typeof value === 'string' && value.trim() !== '');

describe('getTests', () => {
  test('returns the existing Spanish thought-test catalog', () => {
    const tests = getTests('es');
    expect(tests['stressing-thoughts-1'].title).toBe('Pensamientos estresantes');
    expect(tests['mind-voice'].id).toBe('mind-voice');
    expect(tests['stressing-thoughts-1'].recommendation.byOption.future).toBe(
      'future-thoughts-1',
    );
  });

  test('keeps Spanish wording when the locale is Spanish', () => {
    const tests = getTests('es');
    expect(tests['stressing-thoughts-1'].intro).toContain('Bienvenido/a');
    expect(tests['mind-voice'].questions[0].options[0].label).toContain(
      '¿Cómo has podido hacer esto?',
    );
    expect(tests['stressing-thoughts-1'].recommendation.message).toContain(
      'te recomiendo el siguiente test',
    );
  });

  test('serves English thought-test copy without falling back to Spanish', () => {
    const esTests = getTests('es');
    const enTests = getTests('en');
    const testIds = Object.keys(esTests).sort();

    expect(Object.keys(enTests).sort()).toEqual(testIds);

    testIds.forEach((id) => {
      const spanish = esTests[id];
      const english = enTests[id];
      expect(english.id).toBe(spanish.id);
      expect(english.title).not.toBe(spanish.title);
      expect(english.intro).not.toBe(spanish.intro);
      expect(english.journalingPrompt).not.toBe(spanish.journalingPrompt);
      expect(english.coursePromo.title).not.toBe(spanish.coursePromo.title);
      expect(english.coursePromo.paragraph).not.toBe(spanish.coursePromo.paragraph);
      expect(english.coursePromo.buttonLabel).not.toBe(spanish.coursePromo.buttonLabel);
      expect(english.questions).toHaveLength(spanish.questions.length);
      english.questions.forEach((question, questionIndex) => {
        const sourceQuestion = spanish.questions[questionIndex];
        expect(question.id).toBe(sourceQuestion.id);
        expect(question.type).toBe(sourceQuestion.type);
        expect(question.prompt).not.toBe(sourceQuestion.prompt);
        expect(question.options).toHaveLength(sourceQuestion.options.length);
        question.options.forEach((option, optionIndex) => {
          expect(option.id).toBe(sourceQuestion.options[optionIndex].id);
          expect(option.label).not.toBe(sourceQuestion.options[optionIndex].label);
        });
      });
    });

    expect(enTests['stressing-thoughts-1'].recommendation.byOption).toEqual(
      esTests['stressing-thoughts-1'].recommendation.byOption,
    );
    expect(enTests['stressing-thoughts-1'].recommendation.keyQuestionId).toBe(
      esTests['stressing-thoughts-1'].recommendation.keyQuestionId,
    );
    expect(enTests['stressing-thoughts-1'].recommendation.message).not.toBe(
      esTests['stressing-thoughts-1'].recommendation.message,
    );
    expect(enTests['mind-voice'].recommendation).toBeUndefined();

    userFacingTestStrings(enTests).forEach((value) => {
      expect(value).not.toMatch(SPANISH_LEFTOVER);
    });
  });
});

describe('getTestExtras', () => {
  test('keeps Spanish loading quotes and acknowledgments for Spanish', () => {
    const extras = getTestExtras('es');
    expect(extras.loadingQuotes[0]).toContain('Sócrates');
    expect(extras.loadingQuotes[1]).toContain('Pienso, luego existo');
    expect(extras.journalAcknowledgments[0]).toContain('Me alegra');
  });

  test('serves English loading quotes and acknowledgments', () => {
    const esExtras = getTestExtras('es');
    const enExtras = getTestExtras('en');

    expect(enExtras.loadingQuotes).toHaveLength(esExtras.loadingQuotes.length);
    expect(enExtras.journalAcknowledgments).toHaveLength(
      esExtras.journalAcknowledgments.length,
    );
    enExtras.loadingQuotes.forEach((quote, index) => {
      expect(quote).not.toBe(esExtras.loadingQuotes[index]);
      expect(quote).not.toMatch(SPANISH_LEFTOVER);
    });
    enExtras.journalAcknowledgments.forEach((line, index) => {
      expect(line).not.toBe(esExtras.journalAcknowledgments[index]);
      expect(line).not.toMatch(SPANISH_LEFTOVER);
    });

    expect(enExtras.loadingQuotes).toEqual(
      expect.arrayContaining([
        expect.stringContaining('The unexamined life is not worth living'),
        expect.stringContaining('Socrates'),
        expect.stringContaining('I think, therefore I am'),
        expect.stringContaining('René Descartes'),
        expect.stringMatching(/nothing more to add/i),
        expect.stringContaining('Antoine de Saint-Exupéry'),
      ]),
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

  test('falls back to Spanish theory until English is written', () => {
    const esTheory = getTheory('es');
    const enTheory = getTheory('en');
    expect(enTheory.title).toBe(esTheory.title);
    expect(enTheory.Body).toBe(esTheory.Body);
  });
});
