import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  extractEmailFromToken,
  generateLoginToken,
  hashToken,
} from './token.js';

process.env.MAGIC_LINK_SECRET = 'test-magic-link-secret';

test('a generated token round-trips the email', () => {
  assert.equal(extractEmailFromToken(generateLoginToken('a@b.com')), 'a@b.com');
});

test('two tokens for the same email differ because of the nonce', () => {
  const first = generateLoginToken('a@b.com');
  const second = generateLoginToken('a@b.com');
  assert.notEqual(first, second);
  assert.equal(extractEmailFromToken(first), 'a@b.com');
  assert.equal(extractEmailFromToken(second), 'a@b.com');
});

test('extractEmailFromToken returns null for malformed tokens', () => {
  assert.equal(extractEmailFromToken('not-base64!!'), null);
  assert.equal(extractEmailFromToken(Buffer.from('{}').toString('base64url')), null);
});

test('hashToken is stable for the same input and changes when the input changes', () => {
  assert.equal(hashToken('abc'), hashToken('abc'));
  assert.notEqual(hashToken('abc'), hashToken('abd'));
});

test('changing the email inside a token changes its hash', () => {
  const token = generateLoginToken('a@b.com');
  const payload = JSON.parse(Buffer.from(token, 'base64url').toString());
  payload.email = 'c@d.com';
  const tampered = Buffer.from(JSON.stringify(payload)).toString('base64url');
  assert.notEqual(hashToken(token), hashToken(tampered));
});
