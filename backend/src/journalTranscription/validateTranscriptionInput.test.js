import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateTranscriptionInput,
  MAX_IMAGE_BYTES,
} from './validateTranscriptionInput.js';

const jpeg = (extra = 0) =>
  Buffer.concat([Buffer.from([0xff, 0xd8, 0xff]), Buffer.alloc(extra)]);
const png = () =>
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
const webp = () =>
  Buffer.concat([
    Buffer.from('RIFF', 'ascii'),
    Buffer.alloc(4),
    Buffer.from('WEBP', 'ascii'),
  ]);

test('accepts a valid JPEG and returns the detected mime type', () => {
  const result = validateTranscriptionInput({ buffer: jpeg(), mimetype: 'image/jpeg' });
  assert.deepEqual(result, { valid: true, mimeType: 'image/jpeg' });
});

test('accepts a valid PNG', () => {
  const result = validateTranscriptionInput({ buffer: png(), mimetype: 'image/png' });
  assert.deepEqual(result, { valid: true, mimeType: 'image/png' });
});

test('accepts a valid WebP', () => {
  const result = validateTranscriptionInput({ buffer: webp(), mimetype: 'image/webp' });
  assert.deepEqual(result, { valid: true, mimeType: 'image/webp' });
});

test('rejects a missing file', () => {
  const result = validateTranscriptionInput(undefined);
  assert.equal(result.valid, false);
});

test('rejects an empty buffer', () => {
  const result = validateTranscriptionInput({ buffer: Buffer.alloc(0), mimetype: 'image/png' });
  assert.equal(result.valid, false);
});

test('rejects a disallowed mime type', () => {
  const result = validateTranscriptionInput({ buffer: jpeg(), mimetype: 'image/gif' });
  assert.equal(result.valid, false);
});

test('rejects a mime type that does not match the file signature', () => {
  const result = validateTranscriptionInput({
    buffer: Buffer.from('not an image', 'ascii'),
    mimetype: 'image/png',
  });
  assert.equal(result.valid, false);
});

test('rejects an oversized image', () => {
  const result = validateTranscriptionInput({
    buffer: jpeg(MAX_IMAGE_BYTES + 1),
    mimetype: 'image/jpeg',
  });
  assert.equal(result.valid, false);
});
