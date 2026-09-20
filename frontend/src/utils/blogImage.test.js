import { describe, expect, test } from 'vitest';
import { altTextFromFileName, validateBlogImageFile } from './blogImage.js';

const fakeFile = (type, name = 'photo.jpg') => ({ type, name });

describe('validateBlogImageFile', () => {
  test('accepts jpeg, png, and webp', () => {
    expect(validateBlogImageFile(fakeFile('image/jpeg')).valid).toBe(true);
    expect(validateBlogImageFile(fakeFile('image/png')).valid).toBe(true);
    expect(validateBlogImageFile(fakeFile('image/webp')).valid).toBe(true);
  });

  test('rejects a missing file', () => {
    expect(validateBlogImageFile(undefined).messageKey).toBe('blog.imageMissing');
  });

  test('rejects an unsupported type', () => {
    expect(validateBlogImageFile(fakeFile('image/gif')).messageKey).toBe(
      'blog.imageUnsupported',
    );
  });
});

describe('altTextFromFileName', () => {
  test('uses the file stem as alt text', () => {
    expect(altTextFromFileName('quiet-morning.jpg')).toBe('quiet morning');
  });

  test('falls back when the name is empty', () => {
    expect(altTextFromFileName('')).toBe('image');
  });
});
