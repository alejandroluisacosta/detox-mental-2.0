import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_REVISION_COMMENTS,
  parseRevisionComments,
  toRevisionSummaryJson,
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
  const tooMany = Array.from({ length: MAX_REVISION_COMMENTS + 1 }, () => ({
    section: 'socraticText',
    note: 'Please soften this.',
  }));
  assert.equal(parseRevisionComments(tooMany).error, 'too_many_comments');
});

test('toRevisionSummaryJson uses the generate schema keys', () => {
  assert.deepEqual(
    toRevisionSummaryJson({
      summaryText: 'Reflection',
      mainTopics: ['Work'],
      bestQuote: 'A line',
      socraticText: 'A question?',
      machiavelliText: 'A challenge.',
    }),
    {
      summary: 'Reflection',
      mainTopics: ['Work'],
      bestQuote: 'A line',
      socratic: 'A question?',
      machiavelli: 'A challenge.',
    },
  );
});
