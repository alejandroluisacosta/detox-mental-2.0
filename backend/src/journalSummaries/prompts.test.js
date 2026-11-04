import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildFirstReflectionMessages,
  buildRevisionMessages,
  buildSummaryMessages,
  buildSystemPrompt,
} from './prompts.js';
import { buildCompassContext } from '../compass/compassContext.js';
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

const compassEntries = [
  { id: '1', content: 'hello', topics: [], createdAt: '2026-07-28T00:00:00.000Z' },
];

const summaryWithCompass = (compass) => {
  const [system, user] = buildSummaryMessages({
    entries: compassEntries,
    weekStart: '2026-07-23',
    weekEnd: '2026-07-29',
    locale: 'en',
    compass,
  });
  return { system: system.content, user: user.content };
};

const items = (kind, count) =>
  Array.from({ length: count }, (_, i) => ({
    id: `${kind}-${i + 1}`,
    kind,
    content: `${kind} item ${i + 1}`,
  }));

test('Compass items are listed with their labels when the user has some', () => {
  const { user } = summaryWithCompass(
    buildCompassContext({
      items: [...items('goal', 1), ...items('memory', 2)],
      dismissed: [],
    }),
  );
  assert.match(user, /G1\W+goal item 1/);
  assert.match(user, /M1\W+memory item 1/);
  assert.match(user, /M2\W+memory item 2/);
});

test('an empty Compass adds no item list, but suggestions stay enabled', () => {
  const { system, user } = summaryWithCompass(buildCompassContext({ items: [], dismissed: [] }));
  assert.doesNotMatch(user, /\b[GM]1\b/);
  assert.match(system, /"compass"/);
});

test('the cap instruction appears only for a kind that is full', () => {
  const below = summaryWithCompass(
    buildCompassContext({ items: [...items('memory', 14), ...items('goal', 3)], dismissed: [] }),
  );
  assert.doesNotMatch(below.user, /Memories 14\/15/i);
  assert.match(below.user, /Goals 3\/3/i);

  const full = summaryWithCompass(
    buildCompassContext({ items: items('memory', 15), dismissed: [] }),
  );
  assert.match(full.user, /Memories 15\/15/i);
  assert.doesNotMatch(full.user, /Goals 0\/3/i);
});

test('recently dismissed texts are listed only when there are some', () => {
  const none = summaryWithCompass(buildCompassContext({ items: [], dismissed: [] }));
  const some = summaryWithCompass(
    buildCompassContext({
      items: [],
      dismissed: [{ action: 'add', kind: 'goal', text: 'Run a marathon.' }],
    }),
  );
  assert.match(some.user, /Run a marathon\./);
  assert.ok(some.user.length > none.user.length);
});

test('summaries without a Compass context and the anonymous first reflection never ask for suggestions', () => {
  const { system } = summaryWithCompass(undefined);
  assert.doesNotMatch(system, /"compass"/);

  const [firstSystem, firstUser] = buildFirstReflectionMessages({ content: 'One entry.', locale: 'en' });
  assert.doesNotMatch(firstSystem.content, /"compass"/);
  assert.doesNotMatch(firstUser.content, /Compass/);
});

test('revision prompts carry the Compass context too', () => {
  const [system, user] = buildRevisionMessages({
    entries: compassEntries,
    weekStart: '2026-07-23',
    weekEnd: '2026-07-29',
    locale: 'en',
    generationCount: 1,
    previousSummary: { summaryText: 'x', mainTopics: [], bestQuote: 'x', socraticText: 'x' },
    comments: [{ section: 'summaryText', quotedText: 'x', note: 'I already run.' }],
    compass: buildCompassContext({ items: items('goal', 1), dismissed: [] }),
  });
  assert.match(system.content, /"compass"/);
  assert.match(user.content, /G1\W+goal item 1/);
});
