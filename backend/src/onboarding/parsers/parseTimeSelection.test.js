import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseTimeSelection } from './parseTimeSelection.js';

test('accepts a leading 2 or 5 the way Spanish users already type it', () => {
  assert.equal(parseTimeSelection('2 minutos'), 2);
  assert.equal(parseTimeSelection('5'), 5);
  assert.equal(parseTimeSelection('15 minutos'), 15);
});

test('rejects numbers that are not a offered duration', () => {
  assert.equal(parseTimeSelection('3 minutos'), null);
  assert.equal(parseTimeSelection('25'), null);
  assert.equal(parseTimeSelection(''), null);
});

test('accepts Spanish and English word forms without dropping digit replies', () => {
  assert.equal(parseTimeSelection('dos minutos'), 2);
  assert.equal(parseTimeSelection('DOS'), 2);
  assert.equal(parseTimeSelection('two minutes'), 2);
  assert.equal(parseTimeSelection('cinco minutos'), 5);
  assert.equal(parseTimeSelection('five minutes'), 5);
  assert.equal(parseTimeSelection('I want 2 minutes'), 2);
  assert.equal(parseTimeSelection('quiero 5 minutos'), 5);
});

test('returns null when 2 and 5 are both present', () => {
  assert.equal(parseTimeSelection('2 o 5'), null);
  assert.equal(parseTimeSelection('two or five'), null);
  assert.equal(parseTimeSelection('dos o cinco'), null);
});
