import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseTopicName } from './parseTopicName.js';

test('accepts a trimmed custom topic name', () => {
  assert.deepEqual(parseTopicName('  Family life  '), {
    ok: true,
    name: 'Family life',
  });
});

test('collapses internal whitespace', () => {
  assert.deepEqual(parseTopicName('Morning   pages'), {
    ok: true,
    name: 'Morning pages',
  });
});

test('rejects empty or whitespace-only names', () => {
  assert.deepEqual(parseTopicName(''), { ok: false, messageKey: 'topicNameRequired' });
  assert.deepEqual(parseTopicName('   '), { ok: false, messageKey: 'topicNameRequired' });
  assert.deepEqual(parseTopicName(null), { ok: false, messageKey: 'topicNameRequired' });
});

test('rejects names longer than 24 characters', () => {
  assert.deepEqual(parseTopicName('This name is far too long!!'), {
    ok: false,
    messageKey: 'topicNameTooLong',
  });
});

test('rejects reserved slugs in any casing', () => {
  assert.deepEqual(parseTopicName('work'), { ok: false, messageKey: 'topicNameReserved' });
  assert.deepEqual(parseTopicName('Work'), { ok: false, messageKey: 'topicNameReserved' });
  assert.deepEqual(parseTopicName('WORK'), { ok: false, messageKey: 'topicNameReserved' });
});

test('rejects reserved English and Spanish labels', () => {
  assert.deepEqual(parseTopicName('Wisdom'), {
    ok: false,
    messageKey: 'topicNameReserved',
  });
  assert.deepEqual(parseTopicName('Trabajo'), {
    ok: false,
    messageKey: 'topicNameReserved',
  });
  assert.deepEqual(parseTopicName('Reflexión'), {
    ok: false,
    messageKey: 'topicNameReserved',
  });
});
