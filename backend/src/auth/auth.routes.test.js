import { test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import cookieParser from 'cookie-parser';

// The router's import graph builds the Resend client, which demands a key.
process.env.RESEND_API_KEY ??= 're_test_placeholder';
const { default: router } = await import('./auth.routes.js');

const requestWithoutSession = async (path) => {
  const app = express();
  app.use(cookieParser());
  app.use('/auth', router);
  const server = app.listen(0);
  try {
    const { port } = server.address();
    return await fetch(`http://127.0.0.1:${port}${path}`);
  } finally {
    server.close();
  }
};

test('the journal memory endpoint rejects requests without a session', async () => {
  const res = await requestWithoutSession('/auth/me/journal-memory');
  assert.equal(res.status, 401);
});
