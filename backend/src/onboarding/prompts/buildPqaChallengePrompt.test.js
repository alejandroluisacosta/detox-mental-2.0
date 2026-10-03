import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPqaChallengeMessages } from './buildPqaChallengePrompt.js';

test('English challenge prompt requires an English question for the user', () => {
  const [message] = buildPqaChallengeMessages(
    'I keep thinking I will fail at work.',
    'en',
  );
  assert.match(message.content, /I keep thinking I will fail at work/);
  assert.match(message.content, /written in English/i);
  assert.match(message.content, /"you"/);
  assert.doesNotMatch(message.content, /same language as the thought/);
});

test('Spanish challenge prompt requires a Spanish question for the user', () => {
  const [message] = buildPqaChallengeMessages(
    'Siempre creo que voy a fallar.',
    'es',
  );
  assert.match(message.content, /Siempre creo que voy a fallar/);
  assert.match(message.content, /written in Spanish/i);
  assert.match(message.content, /"tú"/);
});
