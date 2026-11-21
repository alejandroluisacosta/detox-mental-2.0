import { test } from 'node:test';
import assert from 'node:assert/strict';
import { anniversaryLookups } from './anniversary.js';

test('an ordinary day looks up exactly one year ago first, then exactly one month ago', () => {
  assert.deepEqual(anniversaryLookups('2026-11-21'), [
    { horizon: '1y', date: '2025-11-21' },
    { horizon: '1m', date: '2026-10-21' },
  ]);
});

test('January looks one month back into December of the previous year', () => {
  assert.deepEqual(anniversaryLookups('2026-01-15'), [
    { horizon: '1y', date: '2025-01-15' },
    { horizon: '1m', date: '2025-12-15' },
  ]);
});

test('the 31st has no monthly anniversary when the previous month is shorter', () => {
  assert.deepEqual(anniversaryLookups('2026-03-31'), [{ horizon: '1y', date: '2025-03-31' }]);
});

test('February 29 has no yearly anniversary, only a monthly one', () => {
  assert.deepEqual(anniversaryLookups('2028-02-29'), [{ horizon: '1m', date: '2028-01-29' }]);
});

test('entries from February 29 still get their monthly anniversary on March 29', () => {
  assert.deepEqual(anniversaryLookups('2028-03-29'), [
    { horizon: '1y', date: '2027-03-29' },
    { horizon: '1m', date: '2028-02-29' },
  ]);
});
