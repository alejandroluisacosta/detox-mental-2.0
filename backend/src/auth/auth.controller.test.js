import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { memoryRateLimitDb } from '../rateLimit/rateLimit.testDb.js';

process.env.MAGIC_LINK_SECRET = 'test-secret';
// email.service constructs its Resend client at import time.
process.env.RESEND_API_KEY ??= 're_test_key';
const { login } = await import('./auth.controller.js');

const MIN = 60 * 1000;
const T0 = new Date('2026-10-01T12:00:00.000Z');

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

let db;
let outbox;

// Wraps the rate-limit fake and also accepts the magic_link_tokens insert.
const makeDb = () => {
  const rateDb = memoryRateLimitDb();
  const tokens = [];
  return {
    rows: rateDb.rows,
    tokens,
    fail: false,
    async query(sql, params) {
      if (this.fail) throw new Error('db down');
      if (/INSERT INTO magic_link_tokens/.test(sql)) {
        tokens.push(params[0]);
        return { rows: [] };
      }
      return rateDb.query(sql, params);
    },
  };
};

const request = async ({ email, ip = '1.1.1.1', now = T0 }) => {
  const req = {
    body: { email },
    headers: {},
    socket: { remoteAddress: ip },
    db,
    now,
    sendMagicLinkEmail: async (to, token) => {
      outbox.push({ to, token });
    },
  };
  const res = mockRes();
  await login(req, res);
  return res;
};

beforeEach(() => {
  db = makeDb();
  outbox = [];
});

test('under the limits: generic 200, token stored and email sent', async () => {
  const res = await request({ email: 'a@example.com' });
  assert.equal(res.statusCode, 200);
  assert.equal(outbox.length, 1);
  assert.equal(outbox[0].to, 'a@example.com');
  assert.equal(db.tokens.length, 1);
});

test('4th request for the same email in 15 minutes is 429 and sends nothing', async () => {
  const codes = [];
  let last;
  for (let i = 0; i < 4; i += 1) {
    last = await request({ email: 'a@example.com', ip: `1.1.1.${i}` });
    codes.push(last.statusCode);
  }
  assert.deepEqual(codes, [200, 200, 200, 429]);
  assert.equal(last.body.code, 'login_rate_limited');
  assert.equal(outbox.length, 3);
  assert.equal(db.tokens.length, 3);
});

test('email limit is case- and whitespace-insensitive', async () => {
  await request({ email: 'a@example.com' });
  await request({ email: ' A@Example.com ' });
  await request({ email: 'A@EXAMPLE.COM' });
  const res = await request({ email: 'a@example.com' });
  assert.equal(res.statusCode, 429);
});

test('6th request for the same email within 24h is 429 even when spaced out', async () => {
  const codes = [];
  for (let i = 0; i < 6; i += 1) {
    const res = await request({
      email: 'a@example.com',
      ip: `1.1.1.${i}`,
      now: new Date(T0.getTime() + i * 20 * MIN),
    });
    codes.push(res.statusCode);
  }
  assert.deepEqual(codes, [200, 200, 200, 200, 200, 429]);
  assert.equal(outbox.length, 5);
});

test('11th request from the same IP in an hour is 429 whatever the email', async () => {
  const codes = [];
  for (let i = 0; i < 11; i += 1) {
    const res = await request({ email: `user${i}@example.com` });
    codes.push(res.statusCode);
  }
  assert.deepEqual(codes, [...Array(10).fill(200), 429]);
  assert.equal(outbox.length, 10);
});

test('after 90 emails globally in 24h, the next request is 429', async () => {
  for (let i = 0; i < 90; i += 1) {
    const res = await request({ email: `user${i}@example.com`, ip: `10.0.0.${i}` });
    assert.equal(res.statusCode, 200);
  }
  const res = await request({ email: 'fresh@example.com', ip: '10.9.9.9' });
  assert.equal(res.statusCode, 429);
  assert.equal(outbox.length, 90);
});

test('a request blocked by the IP limit does not spend the email or global budget', async () => {
  for (let i = 0; i < 12; i += 1) await request({ email: `u${i}@example.com` });
  const globalRows = db.rows.filter((r) => r.bucket === 'login_global');
  assert.equal(globalRows.length, 10);
});

test('requests blocked by the email limit spend the IP budget but not the global one', async () => {
  // Accepted trade-off: the IP check runs first, so retries of a blocked email
  // still count against that IP's hourly allowance.
  for (let i = 0; i < 3; i += 1) await request({ email: 'a@example.com' });
  for (let i = 0; i < 7; i += 1) {
    const res = await request({ email: 'a@example.com' });
    assert.equal(res.statusCode, 429);
  }
  assert.equal(db.rows.filter((r) => r.bucket === 'login_global').length, 3);

  const fresh = await request({ email: 'fresh@example.com' });
  assert.equal(fresh.statusCode, 429);
  assert.equal(outbox.length, 3);
});

test('database error during the check: no email is sent, response is the generic 200', async () => {
  db.fail = true;
  const res = await request({ email: 'a@example.com' });
  assert.equal(res.statusCode, 200);
  assert.equal(outbox.length, 0);
});

test('missing email still returns 400', async () => {
  const res = await request({ email: undefined });
  assert.equal(res.statusCode, 400);
  assert.equal(outbox.length, 0);
});

test('stored rate-limit subjects are hashes, not raw emails or IPs', async () => {
  await request({ email: 'a@example.com', ip: '203.0.113.7' });
  const subjects = db.rows.map((r) => r.subject).join(' ');
  assert.ok(!subjects.includes('a@example.com'));
  assert.ok(!subjects.includes('203.0.113.7'));
});
