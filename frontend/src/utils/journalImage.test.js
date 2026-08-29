import { describe, expect, test } from 'vitest';
import { validateImageFile } from './journalImage';

const fakeFile = (type) => ({ type, name: 'x', size: 10 });

describe('validateImageFile', () => {
  test('rejects when no file is provided', () => {
    const result = validateImageFile(null, 'en');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('Select an image.');
  });

  test('accepts JPEG, PNG, and WebP', () => {
    expect(validateImageFile(fakeFile('image/jpeg')).valid).toBe(true);
    expect(validateImageFile(fakeFile('image/png')).valid).toBe(true);
    expect(validateImageFile(fakeFile('image/webp')).valid).toBe(true);
  });

  test('rejects unsupported types with a localized message', () => {
    const english = validateImageFile(fakeFile('image/gif'), 'en');
    expect(english.valid).toBe(false);
    expect(english.message).toBe('Unsupported format. Use JPG, PNG, or WebP.');

    const spanish = validateImageFile(fakeFile('image/gif'), 'es');
    expect(spanish.message).toBe('Formato no admitido. Usa JPG, PNG o WebP.');
  });

  test('rejects a non-image type', () => {
    expect(validateImageFile(fakeFile('application/pdf')).valid).toBe(false);
  });
});
