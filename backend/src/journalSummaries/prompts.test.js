import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildRevisionMessages, buildSummaryMessages, buildSystemPrompt } from './prompts.js';
import { SUMMARY_GENERATIONS_PER_WEEK } from './summaryWeek.js';

test('English prompt asks for a 400–600 word summary', () => {
  const prompt = buildSystemPrompt('en');
  assert.match(prompt, /400–600 words/);
  assert.doesNotMatch(prompt, /700–1,100 words/);
});

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

test('English prompt requires blank-line paragraphs in the summary', () => {
  const prompt = buildSystemPrompt('en');
  assert.match(prompt, /Separate paragraphs in summary with a blank line/);
});

test('revision messages name generation N and include previous JSON plus comments', () => {
  const [system, user] = buildRevisionMessages({
    entries: [
      {
        id: '1',
        content: 'I keep making lists.',
        topics: [],
        createdAt: '2026-07-28T00:00:00.000Z',
      },
    ],
    weekStart: '2026-07-23',
    weekEnd: '2026-07-29',
    locale: 'en',
    generationCount: 1,
    previousSummary: {
      summaryText: 'You treat planning as safety.',
      mainTopics: ['Worries'],
      bestQuote: 'I need a better plan.',
      socraticText: 'What is the plan protecting you from?',
      machiavelliText: 'What do you gain by delaying the decision?',
    },
    comments: [
      {
        section: 'summaryText',
        quotedText: 'You treat planning as safety.',
        note: 'I was exhausted, not making planning into an identity.',
      },
    ],
  });

  assert.match(
    system.content,
    new RegExp(
      `revision 1 of generation 1 of ${SUMMARY_GENERATIONS_PER_WEEK}`,
      'i',
    ),
  );
  assert.match(system.content, /not a new weekly summary from scratch/i);
  assert.match(
    user.content,
    new RegExp(
      `revision 1 of weekly summary generation 1 of ${SUMMARY_GENERATIONS_PER_WEEK}`,
    ),
  );
  assert.match(user.content, /"summary": "You treat planning as safety\."/);
  assert.match(user.content, /"socratic": "What is the plan protecting you from\?"/);
  assert.match(
    user.content,
    /"machiavelli": "What do you gain by delaying the decision\?"/,
  );
  assert.match(user.content, /section=summaryText/);
  assert.match(user.content, /exhausted, not making planning/);
  assert.match(user.content, /I keep making lists/);
});
