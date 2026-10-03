import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildRecommendationReply } from './buildRecommendationReply.js';

const SPANISH_CLOSING =
  'Siempre te recomendaremos que leas la teoría primero para ganar contexto';

test('keeps the existing Spanish high-clarity recommendation', () => {
  const reply = buildRecommendationReply('high', 'es');
  assert.match(reply, /buen nivel de claridad y concreción/);
  assert.match(reply, new RegExp(SPANISH_CLOSING));
  assert.match(reply, /Suerte en tu camino/);
});

test('keeps the existing Spanish low-clarity recommendation', () => {
  const reply = buildRecommendationReply('low', 'es');
  assert.match(reply, /no demuestra demasiada claridad/);
  assert.match(reply, /teoría introductoria/);
  assert.match(reply, new RegExp(SPANISH_CLOSING));
});

test('returns English recommendations that keep the same advice and disclaimer', () => {
  const high = buildRecommendationReply('high', 'en');
  assert.match(high, /clarity and concreteness/i);
  assert.match(high, /short test/i);
  assert.match(high, /read the theory first/i);
  assert.match(high, /decision is yours/i);
  assert.doesNotMatch(high, /claridad y concreción/);

  const low = buildRecommendationReply('unknown', 'en');
  assert.match(low, /introductory theory/i);
  assert.match(low, /read the theory first/i);
  assert.doesNotMatch(low, /\bPQA\b/);
});
