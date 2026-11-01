import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getJournalEntries, postJournalEntry } from './journalEntries.controller.js';

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

test('getJournalEntries returns 400 for an unsupported topic filter', async () => {
  const req = {
    user: { id: 'user-a' },
    query: { topic: 'work' },
    headers: { 'accept-language': 'en' },
  };
  const res = mockRes();

  await getJournalEntries(req, res);

  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /not valid/i);
});

test('postJournalEntry rejects an entry over 10,000 characters before touching the database', async () => {
  const req = {
    user: { id: 'user-a' },
    body: { content: 'x'.repeat(10001) },
    headers: { 'accept-language': 'en' },
  };
  const res = mockRes();

  await postJournalEntry(req, res);

  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /10000 characters/);
});
