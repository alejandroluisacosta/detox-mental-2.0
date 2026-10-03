import { test } from 'node:test';
import assert from 'node:assert/strict';
import handler from '../../api/chat.js';

const mockRes = () => {
  const headers = {};
  const res = {
    statusCode: 200,
    body: null,
    headers,
    setHeader(key, value) {
      headers[key] = value;
    },
    status(code) {
      res.statusCode = code;
      return res;
    },
    json(payload) {
      res.body = payload;
      return res;
    },
    end() {
      return res;
    },
  };
  return res;
};

test('serverless chat reads locale from the body', async () => {
  const res = mockRes();
  await handler(
    {
      method: 'POST',
      body: { message: '', locale: 'en' },
      headers: { 'accept-language': 'es' },
    },
    res,
  );
  assert.equal(res.statusCode, 200);
  assert.match(res.body.reply, /Welcome to Detox Mental/);
});
