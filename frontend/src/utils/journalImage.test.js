import { describe, expect, test } from 'vitest';
import { validateImageFile } from './journalImage';

const fakeFile = (type) => ({ type, name: 'x', size: 10 });

describe('validateImageFile', () => {
  test('rejects when no file is provided', () => {
    expect(validateImageFile(null).valid).toBe(false);
  });

  test('accepts JPEG, PNG, and WebP', () => {
    expect(validateImageFile(fakeFile('image/jpeg')).valid).toBe(true);
    expect(validateImageFile(fakeFile('image/png')).valid).toBe(true);
    expect(validateImageFile(fakeFile('image/webp')).valid).toBe(true);
  });

  test('rejects unsupported types with a message', () => {
    const result = validateImageFile(fakeFile('image/gif'));
    expect(result.valid).toBe(false);
    expect(typeof result.message).toBe('string');
  });

  test('rejects a non-image type', () => {
    expect(validateImageFile(fakeFile('application/pdf')).valid).toBe(false);
  });
});
