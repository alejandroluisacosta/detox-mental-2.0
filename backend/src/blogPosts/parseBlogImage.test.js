import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_BLOG_IMAGE_BYTES,
  parseBlogImageId,
  parseBlogImageUpload,
} from './parseBlogImage.js';

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

test('parseBlogImageId accepts a UUID and lowercases it', () => {
  const parsed = parseBlogImageId('AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE');
  assert.deepEqual(parsed, {
    ok: true,
    id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  });
});

test('parseBlogImageId rejects a missing or malformed id', () => {
  assert.equal(parseBlogImageId('').ok, false);
  assert.equal(parseBlogImageId('not-a-uuid').ok, false);
  assert.equal(parseBlogImageId('  ').ok, false);
});

test('parseBlogImageUpload accepts JPEG, PNG, and WebP signatures', () => {
  assert.deepEqual(parseBlogImageUpload({ buffer: jpeg(), mimetype: 'image/jpeg' }), {
    ok: true,
    mimeType: 'image/jpeg',
    bytes: jpeg(),
  });
  assert.equal(
    parseBlogImageUpload({ buffer: png(), mimetype: 'image/png' }).mimeType,
    'image/png',
  );
  assert.equal(
    parseBlogImageUpload({ buffer: webp(), mimetype: 'image/webp' }).mimeType,
    'image/webp',
  );
});

test('parseBlogImageUpload rejects a missing file', () => {
  const parsed = parseBlogImageUpload(undefined);
  assert.equal(parsed.ok, false);
  assert.equal(parsed.message, 'No image was received.');
});

test('parseBlogImageUpload rejects a disallowed type before storing bytes', () => {
  const parsed = parseBlogImageUpload({ buffer: jpeg(), mimetype: 'image/gif' });
  assert.equal(parsed.ok, false);
  assert.equal(parsed.message, 'Unsupported image format. Use JPG, PNG, or WebP.');
});

test('parseBlogImageUpload rejects a MIME type that does not match the bytes', () => {
  const parsed = parseBlogImageUpload({
    buffer: Buffer.from('not an image', 'ascii'),
    mimetype: 'image/png',
  });
  assert.equal(parsed.ok, false);
  assert.equal(parsed.message, 'The file does not appear to be a valid image.');
});

test('parseBlogImageUpload rejects an oversized image', () => {
  const parsed = parseBlogImageUpload({
    buffer: jpeg(MAX_BLOG_IMAGE_BYTES + 1),
    mimetype: 'image/jpeg',
  });
  assert.equal(parsed.ok, false);
  assert.equal(parsed.message, 'The image is too large (maximum 5 MB).');
});
