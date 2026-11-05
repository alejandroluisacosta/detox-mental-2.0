import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCompassSuggestions } from './parseCompassSuggestions.js';
import { buildCompassContext } from './compassContext.js';

const item = (id, kind, content) => ({ id, kind, content });

const contextWith = (items) => buildCompassContext({ items, dismissed: [] });

test('a missing or non-array compass field means no suggestions', () => {
  const context = contextWith([]);
  assert.deepEqual(parseCompassSuggestions(undefined, context), []);
  assert.deepEqual(parseCompassSuggestions(null, context), []);
  assert.deepEqual(parseCompassSuggestions('add a memory', context), []);
  assert.deepEqual(parseCompassSuggestions({ action: 'add' }, context), []);
});

test('maps labels back to item ids and takes the kind from the target', () => {
  const context = contextWith([
    item('goal-1', 'goal', 'Launch the app.'),
    item('mem-1', 'memory', 'Living in Madrid.'),
    item('mem-2', 'memory', 'Preparing a certification.'),
  ]);

  const result = parseCompassSuggestions(
    [
      { action: 'update', target: 'M1', kind: 'goal', content: 'Moved to Valencia.' },
      { action: 'remove', target: 'M2' },
      { action: 'add', kind: 'goal', content: '  Publish   every two weeks. ' },
    ],
    context,
  );

  assert.deepEqual(result, [
    {
      action: 'update',
      kind: 'memory',
      targetItemId: 'mem-1',
      targetContent: 'Living in Madrid.',
      content: 'Moved to Valencia.',
    },
    {
      action: 'remove',
      kind: 'memory',
      targetItemId: 'mem-2',
      targetContent: 'Preparing a certification.',
      content: null,
    },
    {
      action: 'add',
      kind: 'goal',
      targetItemId: null,
      targetContent: null,
      content: 'Publish every two weeks.',
    },
  ]);
});

test('drops unknown actions, kinds, and target labels', () => {
  const context = contextWith([item('mem-1', 'memory', 'Fact.')]);
  const result = parseCompassSuggestions(
    [
      { action: 'replace', target: 'M1', content: 'x' },
      { action: 'add', kind: 'mood', content: 'Anxious this week.' },
      { action: 'update', target: 'M9', content: 'Nope.' },
      { action: 'remove', target: 'G1' },
      { action: 'remove', target: 'mem-1' },
    ],
    context,
  );
  assert.deepEqual(result, []);
});

test('drops empty content and content over 200 characters', () => {
  const context = contextWith([item('mem-1', 'memory', 'Fact.')]);
  const result = parseCompassSuggestions(
    [
      { action: 'add', kind: 'memory', content: '   ' },
      { action: 'add', kind: 'memory', content: 'x'.repeat(201) },
      { action: 'update', target: 'M1' },
      { action: 'add', kind: 'memory', content: 'y'.repeat(200) },
    ],
    context,
  );
  assert.equal(result.length, 1);
  assert.equal(result[0].content, 'y'.repeat(200));
});

test('drops an add over the cap but keeps an update of that kind', () => {
  const goals = [1, 2, 3].map((n) => item(`g${n}`, 'goal', `Goal ${n}`));
  const context = contextWith(goals);
  const result = parseCompassSuggestions(
    [
      { action: 'add', kind: 'goal', content: 'Goal 4' },
      { action: 'update', target: 'G2', content: 'Goal two, sharper.' },
    ],
    context,
  );
  assert.deepEqual(result.map((s) => s.action), ['update']);
});

test('counts adds in the same batch toward the cap', () => {
  const context = contextWith([item('g1', 'goal', 'Goal 1'), item('g2', 'goal', 'Goal 2')]);
  const result = parseCompassSuggestions(
    [
      { action: 'add', kind: 'goal', content: 'Goal 3' },
      { action: 'add', kind: 'goal', content: 'Goal 4' },
    ],
    context,
  );
  assert.deepEqual(result.map((s) => s.content), ['Goal 3']);
});

test('drops duplicates of existing items and of each other, ignoring case and spaces', () => {
  const context = contextWith([item('mem-1', 'memory', 'Building Detox Mental.')]);
  const result = parseCompassSuggestions(
    [
      { action: 'add', kind: 'memory', content: 'building  detox mental.' },
      { action: 'add', kind: 'goal', content: 'Write a blog.' },
      { action: 'add', kind: 'memory', content: 'WRITE A BLOG.' },
      { action: 'update', target: 'M1', content: 'Building Detox  Mental.' },
    ],
    context,
  );
  assert.deepEqual(result.map((s) => s.content), ['Write a blog.']);
});

test('keeps at most 3 suggestions', () => {
  const context = contextWith([]);
  const result = parseCompassSuggestions(
    [1, 2, 3, 4, 5].map((n) => ({ action: 'add', kind: 'memory', content: `Fact ${n}` })),
    context,
  );
  assert.deepEqual(result.map((s) => s.content), ['Fact 1', 'Fact 2', 'Fact 3']);
});

test('never suggests two changes to the same item', () => {
  const context = contextWith([item('mem-1', 'memory', 'Fact.')]);
  const result = parseCompassSuggestions(
    [
      { action: 'update', target: 'M1', content: 'Better fact.' },
      { action: 'remove', target: 'M1' },
    ],
    context,
  );
  assert.deepEqual(result.map((s) => s.action), ['update']);
});

test('drops suggestions the user recently dismissed, ignoring case and spaces', () => {
  const context = buildCompassContext({
    items: [item('mem-1', 'memory', 'Living in Madrid.'), item('goal-1', 'goal', 'Launch the app.')],
    dismissed: [
      { action: 'add', kind: 'memory', text: 'Works at an agency.' },
      { action: 'update', kind: 'memory', text: 'Moved to Valencia.' },
      { action: 'remove', kind: 'goal', text: 'Launch the app.' },
    ],
  });

  const result = parseCompassSuggestions(
    [
      { action: 'add', kind: 'memory', content: 'works  at an AGENCY.' },
      { action: 'update', target: 'M1', content: 'Moved to Valencia.' },
      { action: 'remove', target: 'G1' },
      { action: 'remove', target: 'M1' },
    ],
    context,
  );

  // "Keep it" on G1 says nothing about M1, so that removal is still offered.
  assert.deepEqual(result.map((s) => [s.action, s.targetItemId]), [['remove', 'mem-1']]);
});

test('a dismissed removal does not block a new text equal to it, nor the reverse', () => {
  const context = buildCompassContext({
    items: [item('mem-1', 'memory', 'Living in Madrid.')],
    dismissed: [{ action: 'add', kind: 'memory', text: 'Living in Madrid.' }],
  });

  const result = parseCompassSuggestions([{ action: 'remove', target: 'M1' }], context);

  assert.deepEqual(result.map((s) => s.action), ['remove']);
});
