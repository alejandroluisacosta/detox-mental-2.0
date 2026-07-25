import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildTranscriptionMessages,
  TRANSCRIPTION_PROMPT,
} from './buildTranscriptionMessages.js';

test('builds a single user message with text and image chunks', () => {
  const dataUrl = 'data:image/png;base64,AAAA';
  const messages = buildTranscriptionMessages(dataUrl);

  assert.equal(messages.length, 1);
  assert.equal(messages[0].role, 'user');
  assert.equal(messages[0].content.length, 2);
});

test('includes the transcription prompt as the text chunk', () => {
  const [message] = buildTranscriptionMessages('data:image/png;base64,AAAA');
  const textChunk = message.content.find((c) => c.type === 'text');

  assert.equal(textChunk.text, TRANSCRIPTION_PROMPT);
});

test('passes the image data URL as an image_url chunk', () => {
  const dataUrl = 'data:image/jpeg;base64,BBBB';
  const [message] = buildTranscriptionMessages(dataUrl);
  const imageChunk = message.content.find((c) => c.type === 'image_url');

  assert.equal(imageChunk.image_url.url, dataUrl);
});

test('prompt instructs verbatim, bilingual, non-translating transcription', () => {
  assert.match(TRANSCRIPTION_PROMPT, /Spanish or English/);
  assert.match(TRANSCRIPTION_PROMPT, /do not translate/i);
  assert.match(TRANSCRIPTION_PROMPT, /\[ilegible\]/);
});
