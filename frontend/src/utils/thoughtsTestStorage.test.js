import { beforeEach, describe, expect, test } from 'vitest';
import {
  getThoughtsTestAnswers,
  saveThoughtsTestAnswer,
} from './thoughtsTestStorage';

describe('thoughtsTestStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('returns null when no record exists', () => {
    expect(getThoughtsTestAnswers('missing-test')).toBeNull();
  });

  test('saves and retrieves an answer', () => {
    saveThoughtsTestAnswer('test-1', {
      questionId: 'q1',
      prompt: 'How are you feeling?',
      type: 'text',
      value: 'Anxious',
    });

    const record = getThoughtsTestAnswers('test-1');
    expect(record.testId).toBe('test-1');
    expect(record.answers).toHaveLength(1);
    expect(record.answers[0].value).toBe('Anxious');
  });

  test('replaces an existing answer for the same question instead of duplicating it', () => {
    saveThoughtsTestAnswer('test-1', { questionId: 'q1', value: 'First' });
    saveThoughtsTestAnswer('test-1', { questionId: 'q1', value: 'Second' });

    const record = getThoughtsTestAnswers('test-1');
    expect(record.answers).toHaveLength(1);
    expect(record.answers[0].value).toBe('Second');
  });
});
