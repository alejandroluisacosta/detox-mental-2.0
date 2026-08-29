import { describe, expect, test } from 'vitest';
import { validateImageFile } from './journalImage';

const fakeFile = (type) => ({ type, name: 'x', size: 10 });

describe('validateImageFile', () => {
  test('rejects when no file is provided', () => {
    const result = validateImageFile(null);
    expect(result.valid).toBe(false);
    expect(result.messageKey).toBe('journal.imageMissing');
  });

  test('accepts JPEG, PNG, and WebP', () => {
    expect(validateImageFile(fakeFile('image/jpeg')).valid).toBe(true);
    expect(validateImageFile(fakeFile('image/png')).valid).toBe(true);
    expect(validateImageFile(fakeFile('image/webp')).valid).toBe(true);
  });

  test('rejects unsupported types with a message key', () => {
    const result = validateImageFile(fakeFile('image/gif'));
    expect(result.valid).toBe(false);
    expect(result.messageKey).toBe('journal.imageUnsupported');
  });

  test('rejects a non-image type', () => {
    expect(validateImageFile(fakeFile('application/pdf')).valid).toBe(false);
  });
});
