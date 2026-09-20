import { afterEach, describe, expect, test, vi } from 'vitest';
import { resolveBlogImageSrc } from './blogImageSrc.js';

describe('resolveBlogImageSrc', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test('prefixes stored blog image paths with the API origin', () => {
    expect(resolveBlogImageSrc('/blog/images/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee')).toBe(
      'http://localhost:3000/blog/images/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    );
  });

  test('leaves public files and remote URLs unchanged', () => {
    expect(resolveBlogImageSrc('/images/socrates.webp')).toBe('/images/socrates.webp');
    expect(resolveBlogImageSrc('https://example.com/photo.jpg')).toBe(
      'https://example.com/photo.jpg',
    );
  });
});
