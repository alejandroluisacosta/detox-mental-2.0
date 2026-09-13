import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  COMMENT_SECTIONS,
  MAX_REVISION_COMMENTS,
  parseRevisionComments,
} from './parseRevisionComments.js';

test('parseRevisionComments accepts a valid comment with quoted text', () => {
  const parsed = parseRevisionComments([
    {
      section: 'summaryText',
      quotedText: 'Planning became an identity.',
      note: 'That overstates it.',
    },
  ]);
  assert.equal(parsed.ok, true);
  assert.deepEqual(parsed.value, [
    {
      section: 'summaryText',
      quotedText: 'Planning became an identity.',
      note: 'That overstates it.',
    },
  ]);
});

test('parseRevisionComments rejects an empty list and unknown sections', () => {
  assert.equal(parseRevisionComments([]).ok, false);
  assert.equal(parseRevisionComments('nope').ok, false);
  assert.equal(
    parseRevisionComments([{ section: 'mainTopics', note: 'no' }]).ok,
    false,
  );
  assert.equal(
    parseRevisionComments([{ section: 'bestQuote', note: '   ' }]).ok,
    false,
  );
});

test('parseRevisionComments caps the number of comments', () => {
  const tooMany = Array.from({ length: MAX_REVISION_COMMENTS + 1 }, (_, i) => ({
    section: COMMENT_SECTIONS[i] ?? 'summaryText',
    note: 'Please soften this.',
  }));
  assert.equal(parseRevisionComments(tooMany).error, 'too_many_comments');
});

test('parseRevisionComments accepts two comments on different summary paragraphs', () => {
  const parsed = parseRevisionComments([
    {
      section: 'summaryText',
      quotedText: 'First insight.',
      note: 'Soften this.',
    },
    {
      section: 'summaryText',
      quotedText: 'Second insight.',
      note: 'Keep this.',
    },
  ]);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.value.length, 2);
});

test('parseRevisionComments rejects two comments on the same passage', () => {
  const parsed = parseRevisionComments([
    {
      section: 'summaryText',
      quotedText: 'First insight.',
      note: 'First',
    },
    {
      section: 'summaryText',
      quotedText: 'First insight.',
      note: 'Second',
    },
  ]);
  assert.equal(parsed.error, 'duplicate_comment');
});

test('parseRevisionComments still rejects two comments on the same quote', () => {
  const parsed = parseRevisionComments([
    { section: 'bestQuote', quotedText: 'Never enough', note: 'First' },
    { section: 'bestQuote', quotedText: 'Never enough', note: 'Second' },
  ]);
  assert.equal(parsed.error, 'duplicate_comment');
});
