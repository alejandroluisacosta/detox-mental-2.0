import { describe, expect, test } from 'vitest';
import { answersMatch } from '../../../utils/exerciseAnswers.js';
import { getSessions } from '../index.js';
import { sessionsCopy as esSessionsCopy } from '../es/sessions.js';

// ExerciseModal caps the unlock input at 18 characters. An accepted answer
// longer than that cannot be typed, so the check would never succeed.
const EXERCISE_ANSWER_MAX_LENGTH = 18;

const LANGUAGE_DEPENDENT_ANSWERS = [
  {
    id: 4,
    englishAccepted: ['writing', 'write'],
    spanishOnly: 'ESCRIBIR',
  },
  {
    id: 5,
    englishAccepted: ['Germany'],
    spanishOnly: 'ALEMANIA',
  },
  {
    id: 6,
    englishAccepted: ['Thales of Miletus', 'Thales'],
    spanishOnly: 'TALES DE MILETO',
  },
  {
    id: 8,
    englishAccepted: ['self-knowledge', 'self knowledge'],
    spanishOnly: 'AUTOCONOCIMIENTO',
  },
  {
    id: 10,
    englishAccepted: ['Stoicism'],
    spanishOnly: 'ESTOICISMO',
  },
  {
    id: 13,
    englishAccepted: ['hedonism'],
    spanishOnly: 'HEDONISMO',
  },
];

const spanishText = (sessionId) => {
  const source = esSessionsCopy[String(sessionId)];
  return [
    source.title,
    source.description,
    source.unblockQuestion,
    source.exercise.question,
    source.exercise.text,
    ...(source.exercise.answers ?? []),
  ]
    .filter(Boolean)
    .join('\n');
};

describe('English session translations', () => {
  test('fills every session field so English no longer falls back to Spanish', () => {
    const esSessions = getSessions('es');
    const enSessions = getSessions('en');

    expect(enSessions).toHaveLength(15);
    enSessions.forEach((session, index) => {
      const esSession = esSessions[index];
      expect(session.title).not.toBe(esSession.title);
      expect(session.description).not.toBe(esSession.description);
      expect(session.exercise.question).not.toBe(esSession.exercise.question);
      expect(session.exercise.text).not.toBe(esSession.exercise.text);
      if (esSession.unblockQuestion) {
        expect(session.unblockQuestion).not.toBe(esSession.unblockQuestion);
      } else {
        expect(session.unblockQuestion).toBeNull();
      }
    });
  });

  test('keeps the Spanish source wording and Spanish-only answers', () => {
    const esSessions = getSessions('es');
    expect(esSessions[0].title).toBe('Tú no eres tu mente');
    expect(esSessions[4].exercise.answers).toEqual(['ALEMANIA']);
    expect(esSessions[7].exercise.answers).toEqual(['AUTOCONOCIMIENTO']);
    expect(esSessions[9].exercise.answers).toEqual(['ESTOICISMO']);
    expect(esSessions[12].exercise.answers).toEqual(['HEDONISMO']);
    expect(answersMatch(esSessions[4].exercise.answers, 'ALEMANIA')).toBe(true);
    expect(answersMatch(esSessions[4].exercise.answers, 'Germany')).toBe(false);
    expect(spanishText(2)).toMatch(/siéntete libre de frenar/i);
  });

  test('accepts English answer variants and rejects the Spanish-only forms', () => {
    const enById = Object.fromEntries(getSessions('en').map((session) => [session.id, session]));

    LANGUAGE_DEPENDENT_ANSWERS.forEach(({ id, englishAccepted, spanishOnly }) => {
      const answers = enById[id].exercise.answers;
      englishAccepted.forEach((variant) => {
        expect(answersMatch(answers, variant)).toBe(true);
      });
      expect(answersMatch(answers, spanishOnly)).toBe(false);
    });
  });

  test('keeps accepted English answers typable in the existing 18-character input', () => {
    getSessions('en').forEach((session) => {
      session.exercise.answers.forEach((answer) => {
        expect(String(answer).length).toBeLessThanOrEqual(EXERCISE_ANSWER_MAX_LENGTH);
      });
    });
  });

  test('does not leak Spanish PQA/PQS acronyms into English copy', () => {
    getSessions('en').forEach((session) => {
      const blob = [
        session.title,
        session.description,
        session.unblockQuestion,
        session.exercise.question,
        session.exercise.text,
        ...session.exercise.answers,
      ]
        .filter(Boolean)
        .join('\n');
      expect(blob).not.toMatch(/\bPQA/i);
      expect(blob).not.toMatch(/\bPQS/i);
    });
  });

  test('keeps the session 2 health disclaimer at the same strength', () => {
    const session2 = getSessions('en').find((session) => session.id === 2);
    expect(session2.exercise.text).toMatch(/stop the exercise/i);
    expect(session2.exercise.text).toMatch(/overwhelming/i);
    expect(session2.exercise.text).toMatch(/health professional/i);
  });

  test('uses the glossary English for the five steps in session 13', () => {
    const session13 = getSessions('en').find((session) => session.id === 13);
    expect(session13.unblockQuestion).toMatch(/Step back/i);
    expect(session13.unblockQuestion).toMatch(/Recognize/i);
    expect(session13.unblockQuestion).toMatch(/Understand/i);
    expect(session13.unblockQuestion).toMatch(/Arm yourself/i);
    expect(session13.unblockQuestion).toMatch(/Kill/i);
    expect(session13.unblockQuestion).not.toMatch(/Toma distancia|Ármate|Mata/);
  });
});
