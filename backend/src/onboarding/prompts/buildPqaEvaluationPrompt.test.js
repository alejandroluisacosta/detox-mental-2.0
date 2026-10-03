import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPqaEvaluationPrompt } from './buildPqaEvaluationPrompt.js';

test('evaluation prompt classifies English or Spanish sentences as JSON only', () => {
  const messages = buildPqaEvaluationPrompt(
    'I cannot stop replaying the argument.',
    'en',
  );
  const user = messages.find((m) => m.role === 'user').content;
  assert.match(user, /I cannot stop replaying the argument/);
  assert.match(user, /English or Spanish/i);
  assert.match(user, /"clarity"/);

  const spanish = buildPqaEvaluationPrompt(
    'No puedo dejar de repetir la discusión.',
    'es',
  );
  assert.match(
    spanish.find((m) => m.role === 'user').content,
    /No puedo dejar de repetir la discusión/,
  );
});
