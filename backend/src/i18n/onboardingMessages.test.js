import { test } from 'node:test';
import assert from 'node:assert/strict';
import { onboardingMessage, onboardingMessages } from './onboardingMessages.js';

test('every onboarding message has Spanish and English copy', () => {
  for (const [key, byLocale] of Object.entries(onboardingMessages)) {
    assert.equal(typeof byLocale.es === 'string' || Array.isArray(byLocale.es), true, key);
    assert.equal(typeof byLocale.en === 'string' || Array.isArray(byLocale.en), true, key);
    if (Array.isArray(byLocale.es)) {
      assert.equal(byLocale.es.length, byLocale.en.length, key);
    }
  }
});

test('onboardingMessage keeps the Spanish unknown-chip wording', () => {
  assert.equal(
    onboardingMessage('unknownChip', 'es'),
    'No reconozco esa opción. Elige una de las tarjetas de abajo.',
  );
  assert.match(onboardingMessage('unknownChip', 'en'), /do not recognize that option/i);
});
