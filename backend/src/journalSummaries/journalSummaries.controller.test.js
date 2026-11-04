import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getCurrentJournalSummary,
  postCurrentJournalSummary,
  postCurrentJournalSummaryRevision,
} from './journalSummaries.controller.js';
import { getWeekBounds } from './summaryWeek.js';
import { memoryCompassDb } from '../compass/compass.testDb.js';

const USER_A = 'a0000000-0000-4000-8000-00000000000a';
const DAY_MS = 24 * 60 * 60 * 1000;

const mockRes = () => {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      res.statusCode = code;
      return res;
    },
    json(payload) {
      res.body = payload;
      return res;
    },
  };
  return res;
};

const summaryJson = (compass) =>
  JSON.stringify({
    summary: 'You wrote about work.',
    mainTopics: ['Work'],
    bestQuote: 'I keep building',
    socratic: 'What would change?',
    machiavelli: 'What are you optimizing for?',
    ...(compass === undefined ? {} : { compass }),
  });

/** Fake model: records the prompt it was sent and answers with `raw`. */
const fakeModel = (raw) => {
  const calls = [];
  const complete = async ({ messages }) => {
    calls.push(messages);
    return typeof raw === 'function' ? raw(calls.length) : raw;
  };
  return { complete, calls };
};

const seedWeek = (db) => {
  const now = Date.now();
  db.seedEntry({ userId: USER_A, content: 'I keep building my app at night.', createdAt: new Date(now - 60_000) });
  db.seedEntry({ userId: USER_A, content: 'Work felt heavy again.', createdAt: new Date(now - 120_000) });
};

const send = async (handler, { db, model, body }) => {
  const res = mockRes();
  const listeners = {};
  await handler(
    {
      user: { id: USER_A },
      body,
      db,
      summaryCompletion: model?.complete,
      headers: { 'accept-language': 'en' },
      on: (event, fn) => {
        listeners[event] = fn;
      },
      removeListener: () => {},
    },
    res,
  );
  return res;
};

test('generation still returns the summary (201) when the compass output is invalid', async () => {
  const db = memoryCompassDb();
  seedWeek(db);
  const model = fakeModel(
    summaryJson([
      { action: 'add', kind: 'mood', content: 'Sad.' },
      { action: 'remove', target: 'M42' },
      'not an object',
    ]),
  );

  const res = await send(postCurrentJournalSummary, { db, model });

  assert.equal(res.statusCode, 201);
  assert.equal(res.body.summary.summaryText, 'You wrote about work.');
  assert.deepEqual(res.body.compassSuggestions, []);
  assert.equal(db.suggestions.length, 0);
});

test('generation stores valid suggestions and returns them; GET current returns them too', async () => {
  const db = memoryCompassDb();
  seedWeek(db);
  const model = fakeModel(
    summaryJson([{ action: 'add', kind: 'memory', content: 'Building a journaling app.' }]),
  );

  const res = await send(postCurrentJournalSummary, { db, model });
  assert.equal(res.statusCode, 201);
  assert.deepEqual(
    res.body.compassSuggestions.map((s) => [s.action, s.kind, s.content]),
    [['add', 'memory', 'Building a journaling app.']],
  );

  const current = await send(getCurrentJournalSummary, { db });
  assert.equal(current.statusCode, 200);
  assert.deepEqual(
    current.body.compassSuggestions.map((s) => s.id),
    res.body.compassSuggestions.map((s) => s.id),
  );
  assert.equal(current.body.compassItemCount, 0);
});

test('GET current reports the Compass item count for the nudge', async () => {
  const db = memoryCompassDb();
  db.seedItem({ userId: USER_A, kind: 'goal', content: 'Launch.' });
  db.seedItem({ userId: 'someone-else', kind: 'goal', content: 'Not mine.' });

  const res = await send(getCurrentJournalSummary, { db });
  assert.equal(res.body.compassItemCount, 1);
  assert.deepEqual(res.body.compassSuggestions, []);
});

test('the prompt sent to the model contains the user\'s Compass items', async () => {
  const db = memoryCompassDb();
  seedWeek(db);
  db.seedItem({ userId: USER_A, kind: 'memory', content: 'Building Detox Mental as a side project.' });
  const model = fakeModel(summaryJson([]));

  await send(postCurrentJournalSummary, { db, model });

  const promptText = model.calls[0].map((m) => m.content).join('\n');
  assert.match(promptText, /Building Detox Mental as a side project\./);
});

test('regenerating replaces pending suggestions but keeps dismissed ones', async () => {
  const db = memoryCompassDb();
  seedWeek(db);
  const model = fakeModel((n) =>
    n === 1
      ? summaryJson([
          { action: 'add', kind: 'memory', content: 'First fact.' },
          { action: 'add', kind: 'goal', content: 'First goal.' },
        ])
      : summaryJson([{ action: 'add', kind: 'memory', content: 'Second fact.' }]),
  );

  const first = await send(postCurrentJournalSummary, { db, model });
  const summaryId = first.body.summary.id;
  const dismissed = db.suggestions.find((s) => s.content === 'First goal.');
  dismissed.status = 'dismissed';
  dismissed.dismissed_at = new Date();

  const second = await send(postCurrentJournalSummary, { db, model });
  assert.equal(second.statusCode, 201);
  assert.equal(second.body.summary.id, summaryId);

  const byStatus = (status) =>
    db.suggestions.filter((s) => s.status === status).map((s) => s.content);
  assert.deepEqual(byStatus('pending'), ['Second fact.']);
  assert.deepEqual(byStatus('dismissed'), ['First goal.']);

  // The dismissed text is passed to the model as "do not suggest again".
  const secondPrompt = model.calls[1].map((m) => m.content).join('\n');
  assert.match(secondPrompt, /First goal\./);
});

test('revising replaces the pending suggestions with the revision\'s set', async () => {
  const db = memoryCompassDb();
  seedWeek(db);
  const model = fakeModel((n) =>
    n === 1
      ? summaryJson([{ action: 'add', kind: 'memory', content: 'From the first draft.' }])
      : summaryJson([{ action: 'add', kind: 'memory', content: 'From your comment.' }]),
  );

  await send(postCurrentJournalSummary, { db, model });
  const revised = await send(postCurrentJournalSummaryRevision, {
    db,
    model,
    body: {
      comments: [
        { section: 'summaryText', quotedText: 'You wrote about work.', note: 'I am already building an app.' },
      ],
    },
  });

  assert.equal(revised.statusCode, 201);
  assert.deepEqual(revised.body.compassSuggestions.map((s) => s.content), ['From your comment.']);
  assert.deepEqual(
    db.suggestions.filter((s) => s.status === 'pending').map((s) => s.content),
    ['From your comment.'],
  );
  const revisionPrompt = model.calls[1].map((m) => m.content).join('\n');
  assert.match(revisionPrompt, /I am already building an app\./);
});

test('only suggestions dismissed within the last 28 days reach the prompt', async () => {
  const db = memoryCompassDb();
  seedWeek(db);
  const old = db.seedSummary({ userId: USER_A, weekStart: '2020-01-06' });
  const now = Date.now();
  db.seedSuggestion({
    userId: USER_A,
    summaryId: old.id,
    content: 'Dismissed ten days ago.',
    status: 'dismissed',
    dismissedAt: new Date(now - 10 * DAY_MS),
  });
  db.seedSuggestion({
    userId: USER_A,
    summaryId: old.id,
    content: 'Dismissed forty days ago.',
    status: 'dismissed',
    dismissedAt: new Date(now - 40 * DAY_MS),
  });
  const model = fakeModel(summaryJson([]));

  await send(postCurrentJournalSummary, { db, model });

  const promptText = model.calls[0].map((m) => m.content).join('\n');
  assert.match(promptText, /Dismissed ten days ago\./);
  assert.doesNotMatch(promptText, /Dismissed forty days ago\./);
});

test('suggestions on an old week\'s summary are not returned for the current week', async () => {
  const db = memoryCompassDb();
  const old = db.seedSummary({ userId: USER_A, weekStart: '2020-01-06' });
  db.seedSuggestion({ userId: USER_A, summaryId: old.id, content: 'Old leftover.' });
  db.seedSummary({ userId: USER_A, weekStart: getWeekBounds(new Date()).weekStart });

  const res = await send(getCurrentJournalSummary, { db });
  assert.deepEqual(res.body.compassSuggestions, []);
});
