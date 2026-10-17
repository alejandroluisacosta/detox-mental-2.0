import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { clientIp } from './clientIp.js';

const originalVercel = process.env.VERCEL;
afterEach(() => {
  if (originalVercel === undefined) delete process.env.VERCEL;
  else process.env.VERCEL = originalVercel;
});

test('on Vercel, prefers x-real-ip', () => {
  process.env.VERCEL = '1';
  const req = {
    headers: { 'x-real-ip': '9.9.9.9', 'x-forwarded-for': '1.1.1.1' },
    socket: { remoteAddress: '10.0.0.1' },
  };
  assert.equal(clientIp(req), '9.9.9.9');
});

test('on Vercel, falls back to the first x-forwarded-for entry', () => {
  process.env.VERCEL = '1';
  const req = { headers: { 'x-forwarded-for': '1.1.1.1, 2.2.2.2' } };
  assert.equal(clientIp(req), '1.1.1.1');
});

test('outside Vercel, uses the socket address and ignores spoofable headers', () => {
  delete process.env.VERCEL;
  const req = {
    headers: { 'x-real-ip': '9.9.9.9', 'x-forwarded-for': '1.1.1.1' },
    socket: { remoteAddress: '127.0.0.1' },
  };
  assert.equal(clientIp(req), '127.0.0.1');
});

test('returns "unknown" when no address is available', () => {
  delete process.env.VERCEL;
  assert.equal(clientIp({ headers: {} }), 'unknown');
  process.env.VERCEL = '1';
  assert.equal(clientIp({ headers: {} }), 'unknown');
});
