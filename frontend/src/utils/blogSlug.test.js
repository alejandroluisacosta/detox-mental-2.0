import { describe, expect, test } from 'vitest';
import { suggestBlogSlug } from './blogSlug.js';

describe('suggestBlogSlug', () => {
  test('lowercases, strips accents, and hyphenates', () => {
    expect(suggestBlogSlug('La atención es un voto')).toBe('la-atencion-es-un-voto');
  });

  test('returns empty for non-strings', () => {
    expect(suggestBlogSlug(null)).toBe('');
  });
});
