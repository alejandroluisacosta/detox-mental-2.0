import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  extractJsonObject,
  findBestQuoteEntryId,
  parseSummaryOutput,
} from './parseSummaryOutput.js';

test('extractJsonObject parses fenced JSON', () => {
  const raw = '```json\n{"summary":"Hola","mainTopics":["A"],"bestQuote":"x","socratic":"¿Y?"}\n```';
  const obj = extractJsonObject(raw);
  assert.equal(obj.summary, 'Hola');
});

test('parseSummaryOutput normalizes fields', () => {
  const result = parseSummaryOutput(
    JSON.stringify({
      summary: '  esta semana pensaste en el trabajo.  ',
      mainTopics: ['Trabajo', 'Trabajo', '  ', 'Miedo'],
      bestQuote: '"nunca es suficiente"',
      socratic: '¿qué evidencia tienes de que nunca es suficiente?',
    }),
  );
  assert.equal(result.ok, true);
  assert.equal(result.value.summaryText.startsWith('Esta semana'), true);
  assert.deepEqual(result.value.mainTopics, ['Trabajo', 'Miedo']);
  assert.equal(result.value.bestQuote, 'Nunca es suficiente');
  assert.match(result.value.socraticText, /^¿Qué evidencia/i);
});

test('parseSummaryOutput rejects missing fields', () => {
  const result = parseSummaryOutput('{"summary":"solo esto"}');
  assert.equal(result.ok, false);
  assert.equal(result.error, 'missing_fields');
});

test('findBestQuoteEntryId matches source entry ignoring case/accents', () => {
  const entries = [
    { id: 'a', content: 'Hoy me sentí cansado.' },
    { id: 'b', content: 'Nunca es suficiente para mí.' },
  ];
  assert.equal(findBestQuoteEntryId('nunca es suficiente', entries), 'b');
  assert.equal(findBestQuoteEntryId('frase inventada total', entries), null);
});
