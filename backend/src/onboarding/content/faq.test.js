import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickLocalized } from '../../i18n/locale.js';
import {
  CHALLENGE_CHIP_LABEL,
  FAQ_ENTRIES,
  FAQ_INTRO,
  FOLLOW_UP_QUESTION,
  getFaqById,
} from './faq.js';

const SPANISH_INTRO = `Bienvenido/a a Detox Mental, tu gimnasio mental virtual.

Yo soy Tales, tu guía al inicio de este proceso.

Te explico dónde estás:

**Detox Mental** es una aplicación para ayudarte a relacionarte mejor con pensamientos que te generan estrés, sin sustituir terapia ni consejo médico.

Aquí tienes respuestas rápidas a lo que suelen preguntarse quienes nos visitan por primera vez.`;

test('Spanish FAQ intro, follow-up, and challenge chip stay exactly as written', () => {
  assert.equal(pickLocalized(FAQ_INTRO, 'es'), SPANISH_INTRO);
  assert.equal(pickLocalized(FOLLOW_UP_QUESTION, 'es'), '¿Qué te gustaría saber ahora?');
  assert.equal(pickLocalized(CHALLENGE_CHIP_LABEL, 'es'), 'Ir al desafío');
});

test('Spanish professional-help and contraindication warnings keep their force', () => {
  const help = pickLocalized(getFaqById('professional_help').markdownBody, 'es');
  assert.match(help, /no sustituye/);
  assert.match(help, /crisis psicológica/);
  assert.match(help, /pensamientos suicidas/);
  assert.match(help, /ayuda profesional/);

  const contra = pickLocalized(
    getFaqById('course_contraindications').markdownBody,
    'es',
  );
  assert.match(contra, /grave o inestable/);
  assert.match(contra, /no está diseñado/);
  assert.match(contra, /profesional de la salud/);
});

test('English FAQ uses tormenting thoughts and does not invent a PQA acronym', () => {
  const englishBodies = FAQ_ENTRIES.map((entry) =>
    pickLocalized(entry.markdownBody, 'en'),
  ).join('\n');
  const englishIntro = pickLocalized(FAQ_INTRO, 'en');
  assert.match(englishIntro, /Welcome to Detox Mental/);
  assert.match(englishIntro, /mental gym/);
  assert.match(englishIntro, /Tales/);
  assert.doesNotMatch(`${englishIntro}\n${englishBodies}`, /\bPQAs?\b/);
});

test('English professional-help and contraindication warnings keep the same force', () => {
  const help = pickLocalized(getFaqById('professional_help').markdownBody, 'en');
  assert.match(help, /does not replace/i);
  assert.match(help, /psychological crisis/i);
  assert.match(help, /suicidal thoughts/i);
  assert.match(help, /professional help/i);

  const contra = pickLocalized(
    getFaqById('course_contraindications').markdownBody,
    'en',
  );
  assert.match(contra, /serious or unstable/i);
  assert.match(contra, /not designed/i);
  assert.match(contra, /health professional/i);
});
