import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickLocalized } from '../../i18n/locale.js';
import {
  COMPRESSED_GUIDE_INTRO,
  CTA_TITLE,
  getCompressedGuide,
  getCompressedGuideFullReply,
} from './compressedGuide.js';

test('Spanish compressed guides and CTA keep the source wording', () => {
  assert.match(pickLocalized(getCompressedGuide(2), 'es'), /tomar distancia/);
  assert.match(pickLocalized(getCompressedGuide(2), 'es'), /Quinto: matar/);
  assert.match(pickLocalized(getCompressedGuide(5), 'es'), /quietud/);
  assert.match(pickLocalized(getCompressedGuide(5), 'es'), /Paso cinco: matar/);
  assert.match(
    pickLocalized(COMPRESSED_GUIDE_INTRO, 'es'),
    /valoramos la práctica, la experimentación/,
  );
  assert.equal(
    pickLocalized(CTA_TITLE, 'es'),
    'Describe los pensamientos que te atormentan en solo una (1) frase.',
  );
  assert.match(getCompressedGuideFullReply('es'), /PQAs \(Pensamientos Que Atormentan\)/);
});

test('English guides use the glossary steps, stillness, and tormenting thoughts', () => {
  const two = pickLocalized(getCompressedGuide(2), 'en');
  const five = pickLocalized(getCompressedGuide(5), 'en');
  assert.match(two, /step back/i);
  assert.match(two, /Recognize/i);
  assert.match(two, /Understand/i);
  assert.match(two, /Arm yourself/i);
  assert.match(two, /Kill/i);
  assert.match(five, /stillness/i);
  assert.match(getCompressedGuideFullReply('en'), /tormenting thoughts/i);
  assert.doesNotMatch(getCompressedGuideFullReply('en'), /\bPQAs?\b/);
  assert.match(
    pickLocalized(CTA_TITLE, 'en'),
    /torment you|tormenting thoughts/i,
  );
});
