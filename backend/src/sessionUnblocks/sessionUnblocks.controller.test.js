import { test } from 'node:test';
import assert from 'node:assert/strict';
import { postSessionUnblock } from './sessionUnblocks.controller.js';
import { hashToken } from '../auth/token.js';

process.env.MAGIC_LINK_SECRET = 'test-magic-link-secret';

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

/**
 * In-memory fake that enforces the same rules as the real DB:
 * - session_unlock_codes holds one code_hash per session_id (or none).
 * - user_unblocked_sessions is per-user (so a cross-user check is possible).
 */
const memoryDb = ({ codeHashesBySession = {} } = {}) => {
  const unblocked = [];
  return {
    async query(sql, params = []) {
      const text = sql.replace(/\s+/g, ' ').trim();

      if (/SELECT code_hash FROM session_unlock_codes/.test(text)) {
        const [sessionId] = params;
        const hash = codeHashesBySession[sessionId];
        return { rows: hash ? [{ code_hash: hash }] : [] };
      }

      if (/INSERT INTO user_unblocked_sessions/.test(text)) {
        const [userId, sessionId] = params;
        unblocked.push({ userId, sessionId });
        return { rows: [] };
      }

      throw new Error(`Unexpected query in fake db: ${text}`);
    },
    _unblocked: unblocked,
  };
};

test('rejects a wrong code and does not unblock the session', async () => {
  const db = memoryDb({ codeHashesBySession: { 4: 'correct-hash-for-session-4' } });
  const req = { user: { id: 'user-1' }, body: { sessionId: 4, code: 'WRONGCODE' }, db };
  const res = mockRes();

  await postSessionUnblock(req, res);

  assert.equal(res.statusCode, 403);
  assert.equal(db._unblocked.length, 0);
});

test('rejects a request with no code at all', async () => {
  const db = memoryDb({ codeHashesBySession: { 4: 'correct-hash-for-session-4' } });
  const req = { user: { id: 'user-1' }, body: { sessionId: 4 }, db };
  const res = mockRes();

  await postSessionUnblock(req, res);

  assert.equal(res.statusCode, 403);
  assert.equal(db._unblocked.length, 0);
});

test('rejects any code when the session has no configured code', async () => {
  const db = memoryDb({ codeHashesBySession: {} });
  const req = { user: { id: 'user-1' }, body: { sessionId: 4, code: 'ANYTHING' }, db };
  const res = mockRes();

  await postSessionUnblock(req, res);

  assert.equal(res.statusCode, 403);
  assert.equal(db._unblocked.length, 0);
});

test('accepts the correct code and records the unblock for that user', async () => {
  const db = memoryDb({ codeHashesBySession: { 4: hashToken('XAATZP') } });
  const req = { user: { id: 'user-1' }, body: { sessionId: 4, code: 'XAATZP' }, db };
  const res = mockRes();

  await postSessionUnblock(req, res);

  assert.equal(res.statusCode, 201);
  assert.deepEqual(db._unblocked, [{ userId: 'user-1', sessionId: 4 }]);
});
