import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getJournalEntries } from './journalEntries.controller.js';

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
