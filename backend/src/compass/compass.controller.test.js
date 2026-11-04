import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  acceptCompassSuggestion,
  deleteCompassItemForUser,
  dismissCompassSuggestion,
  getCompass,
  patchCompassItem,
  postCompassItem,
} from './compass.controller.js';
import { memoryCompassDb } from './compass.testDb.js';
import { getWeekBounds } from '../journalSummaries/summaryWeek.js';

const USER_A = 'a0000000-0000-4000-8000-00000000000a';
const USER_B = 'b0000000-0000-4000-8000-00000000000b';

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
    send() {
      return res;
    },
  };
  return res;
};

const call = async (handler, { db, userId = USER_A, params = {}, body } = {}) => {
  const res = mockRes();
  await handler(
    { user: { id: userId }, params, body, db, headers: { 'accept-language': 'en' } },
    res,
  );
  return res;
};

const currentWeekStart = () => getWeekBounds(new Date()).weekStart;

// ---- items ----

test('an empty Compass returns no items, the limits, and zero pending suggestions', async () => {
  const db = memoryCompassDb();
  const res = await call(getCompass, { db });

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body.goals, []);
  assert.deepEqual(res.body.memories, []);
  assert.deepEqual(res.body.limits, { goal: 3, memory: 15, chars: 200 });
  assert.equal(res.body.pendingSuggestionCount, 0);
});

test('an added memory is listed under memories, trimmed, and only for its owner', async () => {
  const db = memoryCompassDb();
  const created = await call(postCompassItem, {
    db,
    body: { kind: 'memory', content: '  Building a journaling app.  ' },
  });
  assert.equal(created.statusCode, 201);
  assert.equal(created.body.item.content, 'Building a journaling app.');

  const mine = await call(getCompass, { db });
  assert.deepEqual(
    mine.body.memories.map((m) => m.content),
    ['Building a journaling app.'],
  );
  assert.deepEqual(mine.body.goals, []);

  const theirs = await call(getCompass, { db, userId: USER_B });
  assert.deepEqual(theirs.body.memories, []);
});

test('an item of 201 characters is rejected with 400 and an empty one too', async () => {
  const db = memoryCompassDb();
  const long = await call(postCompassItem, {
    db,
    body: { kind: 'goal', content: 'x'.repeat(201) },
  });
  assert.equal(long.statusCode, 400);
  assert.match(long.body.message, /200 characters/);

  const empty = await call(postCompassItem, { db, body: { kind: 'goal', content: '   ' } });
  assert.equal(empty.statusCode, 400);

  const ok = await call(postCompassItem, { db, body: { kind: 'goal', content: 'x'.repeat(200) } });
  assert.equal(ok.statusCode, 201);
  assert.equal(db.items.length, 1);
});

test('an unknown kind is rejected with 400', async () => {
  const db = memoryCompassDb();
  const res = await call(postCompassItem, { db, body: { kind: 'mood', content: 'Tired' } });
  assert.equal(res.statusCode, 400);
  assert.equal(db.items.length, 0);
});

test('the 4th goal is rejected with 409', async () => {
  const db = memoryCompassDb();
  for (let i = 1; i <= 3; i += 1) {
    const res = await call(postCompassItem, { db, body: { kind: 'goal', content: `Goal ${i}` } });
    assert.equal(res.statusCode, 201);
  }
  const fourth = await call(postCompassItem, { db, body: { kind: 'goal', content: 'Goal 4' } });
  assert.equal(fourth.statusCode, 409);
  assert.equal(fourth.body.code, 'compass_full');
  assert.equal(db.items.filter((i) => i.kind === 'goal').length, 3);

  // A full goal list does not block memories, nor another user's goals.
  const memory = await call(postCompassItem, { db, body: { kind: 'memory', content: 'Fact' } });
  assert.equal(memory.statusCode, 201);
  const other = await call(postCompassItem, {
    db,
    userId: USER_B,
    body: { kind: 'goal', content: 'Their goal' },
  });
  assert.equal(other.statusCode, 201);
});

test('the 16th memory is rejected with 409', async () => {
  const db = memoryCompassDb();
  for (let i = 1; i <= 15; i += 1) {
    db.seedItem({ userId: USER_A, kind: 'memory', content: `Fact ${i}` });
  }
  const res = await call(postCompassItem, { db, body: { kind: 'memory', content: 'Fact 16' } });
  assert.equal(res.statusCode, 409);
  assert.equal(db.items.length, 15);
});

test('editing an item saves the new text and validates its length', async () => {
  const db = memoryCompassDb();
  const item = db.seedItem({ userId: USER_A, kind: 'memory', content: 'Living in Madrid.' });

  const tooLong = await call(patchCompassItem, {
    db,
    params: { id: item.id },
    body: { content: 'y'.repeat(201) },
  });
  assert.equal(tooLong.statusCode, 400);

  const res = await call(patchCompassItem, {
    db,
    params: { id: item.id },
    body: { content: 'Living in Valencia.' },
  });
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.item.content, 'Living in Valencia.');
  assert.equal(db.items[0].content, 'Living in Valencia.');
});

test('deleting an item removes it', async () => {
  const db = memoryCompassDb();
  const item = db.seedItem({ userId: USER_A, kind: 'goal', content: 'Launch.' });
  const res = await call(deleteCompassItemForUser, { db, params: { id: item.id } });
  assert.equal(res.statusCode, 204);
  const after = await call(getCompass, { db });
  assert.deepEqual(after.body.goals, []);
});

test('user B cannot read, edit, or delete user A\'s item', async () => {
  const db = memoryCompassDb();
  const item = db.seedItem({ userId: USER_A, kind: 'memory', content: 'A private fact.' });

  const read = await call(getCompass, { db, userId: USER_B });
  assert.deepEqual(read.body.memories, []);

  const edit = await call(patchCompassItem, {
    db,
    userId: USER_B,
    params: { id: item.id },
    body: { content: 'Hijacked.' },
  });
  assert.equal(edit.statusCode, 404);

  const del = await call(deleteCompassItemForUser, { db, userId: USER_B, params: { id: item.id } });
  assert.equal(del.statusCode, 404);

  assert.equal(db.items.length, 1);
  assert.equal(db.items[0].content, 'A private fact.');
});

test('a malformed item id is a 404, not a server error', async () => {
  const db = memoryCompassDb();
  const res = await call(patchCompassItem, {
    db,
    params: { id: 'not-a-uuid' },
    body: { content: 'Anything.' },
  });
  assert.equal(res.statusCode, 404);
});

// ---- suggestions ----

test('pendingSuggestionCount counts only this week\'s summary', async () => {
  const db = memoryCompassDb();
  const current = db.seedSummary({ userId: USER_A, weekStart: currentWeekStart() });
  const old = db.seedSummary({ userId: USER_A, weekStart: '2020-01-06' });
  db.seedSuggestion({ userId: USER_A, summaryId: current.id });
  db.seedSuggestion({ userId: USER_A, summaryId: current.id, kind: 'goal' });
  db.seedSuggestion({ userId: USER_A, summaryId: current.id, status: 'dismissed', dismissedAt: new Date() });
  db.seedSuggestion({ userId: USER_A, summaryId: old.id });

  const res = await call(getCompass, { db });
  assert.equal(res.body.pendingSuggestionCount, 2);
});

test('accepting an add suggestion creates the item and resolves the suggestion', async () => {
  const db = memoryCompassDb();
  const summary = db.seedSummary({ userId: USER_A, weekStart: currentWeekStart() });
  const suggestion = db.seedSuggestion({
    userId: USER_A,
    summaryId: summary.id,
    kind: 'goal',
    content: 'Move into a product role.',
  });

  const res = await call(acceptCompassSuggestion, { db, params: { id: suggestion.id } });
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.item.content, 'Move into a product role.');

  const compass = await call(getCompass, { db });
  assert.deepEqual(compass.body.goals.map((g) => g.content), ['Move into a product role.']);
  assert.equal(compass.body.pendingSuggestionCount, 0);

  const again = await call(acceptCompassSuggestion, { db, params: { id: suggestion.id } });
  assert.equal(again.statusCode, 404);
  assert.equal(db.items.length, 1);
});

test('accepting with edited content saves the edited text', async () => {
  const db = memoryCompassDb();
  const summary = db.seedSummary({ userId: USER_A, weekStart: currentWeekStart() });
  const suggestion = db.seedSuggestion({
    userId: USER_A,
    summaryId: summary.id,
    content: 'Frontend developer.',
  });

  const tooLong = await call(acceptCompassSuggestion, {
    db,
    params: { id: suggestion.id },
    body: { content: 'z'.repeat(201) },
  });
  assert.equal(tooLong.statusCode, 400);
  assert.equal(db.items.length, 0);

  const res = await call(acceptCompassSuggestion, {
    db,
    params: { id: suggestion.id },
    body: { content: 'Frontend developer at an agency.' },
  });
  assert.equal(res.statusCode, 200);
  assert.equal(db.items[0].content, 'Frontend developer at an agency.');
});

test('accepting an update suggestion replaces the target item text', async () => {
  const db = memoryCompassDb();
  const summary = db.seedSummary({ userId: USER_A, weekStart: currentWeekStart() });
  const item = db.seedItem({ userId: USER_A, kind: 'memory', content: 'Living in Madrid.' });
  const suggestion = db.seedSuggestion({
    userId: USER_A,
    summaryId: summary.id,
    action: 'update',
    targetItemId: item.id,
    targetContent: 'Living in Madrid.',
    content: 'Moved to Valencia in October.',
  });

  const res = await call(acceptCompassSuggestion, { db, params: { id: suggestion.id } });
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.item.id, item.id);
  assert.deepEqual(db.items.map((i) => i.content), ['Moved to Valencia in October.']);
  assert.equal(db.suggestions.length, 0);
});

test('accepting a remove suggestion deletes the target item', async () => {
  const db = memoryCompassDb();
  const summary = db.seedSummary({ userId: USER_A, weekStart: currentWeekStart() });
  const item = db.seedItem({ userId: USER_A, kind: 'goal', content: 'Get certified.' });
  const suggestion = db.seedSuggestion({
    userId: USER_A,
    summaryId: summary.id,
    action: 'remove',
    kind: 'goal',
    targetItemId: item.id,
    targetContent: 'Get certified.',
  });

  const withContent = await call(acceptCompassSuggestion, {
    db,
    params: { id: suggestion.id },
    body: { content: 'Something else.' },
  });
  assert.equal(withContent.statusCode, 400);
  assert.equal(db.items.length, 1);

  const res = await call(acceptCompassSuggestion, { db, params: { id: suggestion.id } });
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.removedItemId, item.id);
  assert.equal(db.items.length, 0);
});

test('a suggestion whose target was edited afterwards is stale: 409, item unchanged, suggestion gone', async () => {
  const db = memoryCompassDb();
  const summary = db.seedSummary({ userId: USER_A, weekStart: currentWeekStart() });
  const item = db.seedItem({ userId: USER_A, kind: 'memory', content: 'Living in Madrid.' });
  const suggestion = db.seedSuggestion({
    userId: USER_A,
    summaryId: summary.id,
    action: 'update',
    targetItemId: item.id,
    targetContent: 'Living in Madrid.',
    content: 'Living in Sevilla.',
  });

  const edited = await call(patchCompassItem, {
    db,
    params: { id: item.id },
    body: { content: 'Living in Bilbao.' },
  });
  assert.equal(edited.statusCode, 200);

  const res = await call(acceptCompassSuggestion, { db, params: { id: suggestion.id } });
  assert.equal(res.statusCode, 409);
  assert.equal(res.body.code, 'compass_suggestion_stale');
  assert.deepEqual(db.items.map((i) => i.content), ['Living in Bilbao.']);

  const compass = await call(getCompass, { db });
  assert.equal(compass.body.pendingSuggestionCount, 0);
});

test('deleting the target item drops its pending suggestion', async () => {
  const db = memoryCompassDb();
  const summary = db.seedSummary({ userId: USER_A, weekStart: currentWeekStart() });
  const item = db.seedItem({ userId: USER_A, kind: 'memory', content: 'Fact.' });
  const suggestion = db.seedSuggestion({
    userId: USER_A,
    summaryId: summary.id,
    action: 'remove',
    targetItemId: item.id,
    targetContent: 'Fact.',
  });

  await call(deleteCompassItemForUser, { db, params: { id: item.id } });
  const res = await call(acceptCompassSuggestion, { db, params: { id: suggestion.id } });
  assert.equal(res.statusCode, 404);
});

test('accepting an add at the cap returns 409 and keeps the suggestion pending', async () => {
  const db = memoryCompassDb();
  const summary = db.seedSummary({ userId: USER_A, weekStart: currentWeekStart() });
  for (let i = 1; i <= 3; i += 1) {
    db.seedItem({ userId: USER_A, kind: 'goal', content: `Goal ${i}` });
  }
  const suggestion = db.seedSuggestion({
    userId: USER_A,
    summaryId: summary.id,
    kind: 'goal',
    content: 'Goal 4',
  });

  const res = await call(acceptCompassSuggestion, { db, params: { id: suggestion.id } });
  assert.equal(res.statusCode, 409);
  assert.equal(res.body.code, 'compass_full');
  assert.equal(db.items.length, 3);

  const compass = await call(getCompass, { db });
  assert.equal(compass.body.pendingSuggestionCount, 1);
});

test('dismissing a suggestion hides it and keeps it for the cooldown', async () => {
  const db = memoryCompassDb();
  const summary = db.seedSummary({ userId: USER_A, weekStart: currentWeekStart() });
  const suggestion = db.seedSuggestion({ userId: USER_A, summaryId: summary.id });

  const res = await call(dismissCompassSuggestion, { db, params: { id: suggestion.id } });
  assert.equal(res.statusCode, 204);
  assert.equal(db.suggestions[0].status, 'dismissed');

  const compass = await call(getCompass, { db });
  assert.equal(compass.body.pendingSuggestionCount, 0);

  const accept = await call(acceptCompassSuggestion, { db, params: { id: suggestion.id } });
  assert.equal(accept.statusCode, 404);
  assert.equal(db.items.length, 0);
});

test('user B cannot accept or dismiss user A\'s suggestion', async () => {
  const db = memoryCompassDb();
  const summary = db.seedSummary({ userId: USER_A, weekStart: currentWeekStart() });
  const suggestion = db.seedSuggestion({ userId: USER_A, summaryId: summary.id });

  const accept = await call(acceptCompassSuggestion, {
    db,
    userId: USER_B,
    params: { id: suggestion.id },
  });
  assert.equal(accept.statusCode, 404);

  const dismiss = await call(dismissCompassSuggestion, {
    db,
    userId: USER_B,
    params: { id: suggestion.id },
  });
  assert.equal(dismiss.statusCode, 404);

  assert.equal(db.items.length, 0);
  assert.equal(db.suggestions[0].status, 'pending');
});
