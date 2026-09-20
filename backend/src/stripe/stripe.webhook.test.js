import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHandleWebhook } from './stripe.webhook.js';

const mockRes = () => {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      res.statusCode = code;
      return res;
    },
    json(payload) {
      if (res.statusCode == null) res.statusCode = 200;
      res.body = payload;
      return res;
    },
  };
  return res;
};

const createDeps = (overrides = {}) => {
  const grants = { paid: [], unlock: [] };
  return {
    grants,
    deps: {
      stripe: {
        webhooks: {
          constructEvent() {
            return {
              type: 'checkout.session.completed',
              data: {
                object: {
                  id: 'cs_1',
                  metadata: { user_id: 'user-a' },
                  customer: 'cus_1',
                  payment_intent: 'pi_1',
                },
              },
            };
          },
        },
      },
      findUserById: async (id) => (id === 'user-a' ? { id: 'user-a' } : null),
      findUserByStripeCustomerId: async (customerId) =>
        customerId === 'cus_1' ? { id: 'user-a' } : null,
      updateUserPaidStatus: async (userId, paymentIntent) => {
        grants.paid.push({ userId, paymentIntent });
      },
      unlockAllSessionsForUser: async (userId) => {
        grants.unlock.push(userId);
      },
      ...overrides,
    },
  };
};

test('a bad signature is 400 and does not grant access', async () => {
  const { grants, deps } = createDeps({
    stripe: {
      webhooks: {
        constructEvent() {
          throw new Error('bad sig');
        },
      },
    },
  });
  const handleWebhook = createHandleWebhook(deps);
  const res = mockRes();

  await handleWebhook({ headers: { 'stripe-signature': 'nope' }, body: '{}' }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, 'Webhook error: bad sig');
  assert.deepEqual(grants.paid, []);
  assert.deepEqual(grants.unlock, []);
});

test('checkout.session.completed grants the user from metadata.user_id', async () => {
  const { grants, deps } = createDeps();
  const handleWebhook = createHandleWebhook(deps);
  const res = mockRes();

  await handleWebhook({ headers: { 'stripe-signature': 'sig' }, body: '{}' }, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { received: true });
  assert.deepEqual(grants.paid, [{ userId: 'user-a', paymentIntent: 'pi_1' }]);
  assert.deepEqual(grants.unlock, ['user-a']);
});

test('falls back to session.customer when metadata is absent', async () => {
  const { grants, deps } = createDeps({
    stripe: {
      webhooks: {
        constructEvent() {
          return {
            type: 'checkout.session.completed',
            data: {
              object: {
                id: 'cs_1',
                metadata: {},
                customer: 'cus_1',
                payment_intent: 'pi_1',
              },
            },
          };
        },
      },
    },
    findUserById: async () => {
      throw new Error('metadata path should not run');
    },
  });
  const handleWebhook = createHandleWebhook(deps);
  const res = mockRes();

  await handleWebhook({ headers: { 'stripe-signature': 'sig' }, body: '{}' }, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { received: true });
  assert.deepEqual(grants.paid, [{ userId: 'user-a', paymentIntent: 'pi_1' }]);
  assert.deepEqual(grants.unlock, ['user-a']);
});

test('unknown user is 400 and does not grant access', async () => {
  const { grants, deps } = createDeps({
    findUserById: async () => null,
    findUserByStripeCustomerId: async () => null,
  });
  const handleWebhook = createHandleWebhook(deps);
  const res = mockRes();

  await handleWebhook({ headers: { 'stripe-signature': 'sig' }, body: '{}' }, res);

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { message: 'User not found.' });
  assert.deepEqual(grants.paid, []);
  assert.deepEqual(grants.unlock, []);
});

test('an unrelated event type is 200 and does not grant access', async () => {
  const { grants, deps } = createDeps({
    stripe: {
      webhooks: {
        constructEvent() {
          return { type: 'customer.created', data: { object: {} } };
        },
      },
    },
  });
  const handleWebhook = createHandleWebhook(deps);
  const res = mockRes();

  await handleWebhook({ headers: { 'stripe-signature': 'sig' }, body: '{}' }, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { received: true });
  assert.deepEqual(grants.paid, []);
  assert.deepEqual(grants.unlock, []);
});
