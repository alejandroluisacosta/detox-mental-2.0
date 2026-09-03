import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSummaryMessages, buildSystemPrompt } from './prompts.js';

test('English prompt requires English user-facing strings and keeps quotes verbatim', () => {
  const prompt = buildSystemPrompt('en');
  assert.match(prompt, /MUST be written in English/);
  assert.match(prompt, /Address the user directly \("you"\)/);
  assert.match(prompt, /original language of the journal entry/);
  assert.doesNotMatch(prompt, /MUST be written in Spanish/);
});

test('Spanish prompt requires Spanish user-facing strings', () => {
  const prompt = buildSystemPrompt('es');
  assert.match(prompt, /MUST be written in Spanish/);
  assert.match(prompt, /Address the user directly \("tú"\)/);
});

test('buildSummaryMessages passes the requested locale into the system prompt', () => {
  const [system] = buildSummaryMessages({
    entries: [
      {
        id: '1',
        content: 'hello',
        topics: [],
        createdAt: '2026-08-01T00:00:00.000Z',
      },
    ],
    weekStart: '2026-07-27',
    weekEnd: '2026-08-02',
    locale: 'es',
  });
  assert.match(system.content, /MUST be written in Spanish/);
});

test('buildSummaryMessages describes the last 7 days', () => {
  const [, user] = buildSummaryMessages({
    entries: [
      {
        id: '1',
        content: 'hello',
        topics: [],
        createdAt: '2026-07-28T00:00:00.000Z',
      },
    ],
    weekStart: '2026-07-23',
    weekEnd: '2026-07-29',
    locale: 'en',
  });
  assert.match(user.content, /Last 7 days from 2026-07-23 to 2026-07-29/);
});
