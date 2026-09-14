import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isAdminRole, requireAdmin } from './auth.middleware.js';

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
