import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COOKIE_NAME, signJwt } from './jwt.js';
import { createRequireAuth, isAdminRole, requireAdmin } from './auth.middleware.js';

process.env.JWT_SECRET = 'test-jwt-secret';

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

test('isAdminRole only accepts admin', () => {
  assert.equal(isAdminRole('admin'), true);
  assert.equal(isAdminRole('paid'), false);
  assert.equal(isAdminRole('free'), false);
  assert.equal(isAdminRole(undefined), false);
});

test('requireAdmin returns 404 for non-admin users', async () => {
  let statusCode = 0;
  let body = null;
  let nextCalled = false;

  await requireAdmin(
    { user: { role: 'paid' } },
    {
      status(code) {
        statusCode = code;
        return {
          json(payload) {
            body = payload;
            return payload;
          },
        };
      },
    },
    () => {
      nextCalled = true;
    },
  );

  assert.equal(statusCode, 404);
  assert.deepEqual(body, { message: 'Not found.' });
  assert.equal(nextCalled, false);
});

test('requireAdmin continues for admin users', async () => {
  let nextCalled = false;

  await requireAdmin({ user: { role: 'admin' } }, {}, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
});

test('requireAuth returns 401 and skips next when the cookie is missing', async () => {
  const requireAuth = createRequireAuth({ findUserById: async () => ({ id: 'user-1' }) });
  const req = { cookies: {} };
  const res = mockRes();
  let nextCalled = false;

  await requireAuth(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { message: 'Unauthorized.' });
  assert.equal(nextCalled, false);
});

test('requireAuth returns 401 for a malformed JWT', async () => {
  const requireAuth = createRequireAuth({ findUserById: async () => ({ id: 'user-1' }) });
  const req = { cookies: { [COOKIE_NAME]: 'not-a-jwt' } };
  const res = mockRes();
  let nextCalled = false;

  await requireAuth(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { message: 'Unauthorized.' });
  assert.equal(nextCalled, false);
});

test('requireAuth returns 401 when the user is missing or soft-deleted', async () => {
  const requireAuth = createRequireAuth({ findUserById: async () => null });
  const req = { cookies: { [COOKIE_NAME]: signJwt({ user_id: 'gone' }) } };
  const res = mockRes();
  let nextCalled = false;

  await requireAuth(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { message: 'Unauthorized.' });
  assert.equal(nextCalled, false);
});

test('requireAuth returns 500 when the user lookup throws', async () => {
  const requireAuth = createRequireAuth({
    findUserById: async () => {
      throw new Error('db down');
    },
  });
  const req = { cookies: { [COOKIE_NAME]: signJwt({ user_id: 'user-1' }) } };
  const res = mockRes();
  let nextCalled = false;

  await requireAuth(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, { message: 'Internal server error.' });
  assert.equal(nextCalled, false);
});

test('requireAuth loads the user and calls next on a valid session', async () => {
  const user = { id: 'user-1', email: 'a@b.com', role: 'free' };
  const requireAuth = createRequireAuth({ findUserById: async () => user });
  const req = { cookies: { [COOKIE_NAME]: signJwt({ user_id: 'user-1' }) } };
  const res = mockRes();
  let nextCount = 0;

  await requireAuth(req, res, () => {
    nextCount += 1;
  });

  assert.equal(nextCount, 1);
  assert.equal(req.user, user);
  assert.equal(res.statusCode, null);
});
