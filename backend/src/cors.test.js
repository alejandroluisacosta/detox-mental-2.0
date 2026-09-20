import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isAllowedCorsOrigin } from './cors.js';

const FRONTEND_ORIGIN = 'https://www.detoxmental.es';

test('allows the configured frontend origin', () => {
  assert.equal(isAllowedCorsOrigin('https://www.detoxmental.es', FRONTEND_ORIGIN), true);
});

test('allows requests with no Origin header', () => {
  assert.equal(isAllowedCorsOrigin(undefined, FRONTEND_ORIGIN), true);
  assert.equal(isAllowedCorsOrigin('', FRONTEND_ORIGIN), true);
});

test('allows this project’s Vercel preview hosts', () => {
  assert.equal(
    isAllowedCorsOrigin('https://detox-mental-2-0.vercel.app', FRONTEND_ORIGIN),
    true,
  );
  assert.equal(
    isAllowedCorsOrigin(
      'https://detox-mental-2-0-git-cursor-blog-post-images-65e6-alejandro-acostas-projects-e88ef89b.vercel.app',
      FRONTEND_ORIGIN,
    ),
    true,
  );
  assert.equal(
    isAllowedCorsOrigin(
      'https://detox-mental-2-0-4a47u5rch-alejandro-acostas-projects-e88ef89b.vercel.app',
      FRONTEND_ORIGIN,
    ),
    true,
  );
});

test('rejects other Vercel apps and unrelated origins', () => {
  assert.equal(isAllowedCorsOrigin('https://evil.vercel.app', FRONTEND_ORIGIN), false);
  assert.equal(
    isAllowedCorsOrigin('https://detox-mental-backend.vercel.app', FRONTEND_ORIGIN),
    false,
  );
  assert.equal(isAllowedCorsOrigin('https://example.com', FRONTEND_ORIGIN), false);
  assert.equal(
    isAllowedCorsOrigin('http://detox-mental-2-0.vercel.app', FRONTEND_ORIGIN),
    false,
  );
});
