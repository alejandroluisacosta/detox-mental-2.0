import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseBlogCategoryQuery,
  parseBlogPostInput,
  suggestBlogSlug,
} from './parseBlogPost.js';

test('suggestBlogSlug lowercases, strips accents, and hyphenates', () => {
  assert.equal(suggestBlogSlug('La atención es un voto'), 'la-atencion-es-un-voto');
});

test('parseBlogPostInput accepts a complete published post', () => {
  const parsed = parseBlogPostInput({
    title: '  Quiet tools  ',
    slug: 'quiet-tools',
    excerpt: 'A short note.',
    body: 'Full article.',
    category: 'technology',
    status: 'published',
  });

  assert.deepEqual(parsed, {
    ok: true,
    value: {
      title: 'Quiet tools',
      slug: 'quiet-tools',
      excerpt: 'A short note.',
      body: 'Full article.',
      category: 'technology',
      status: 'published',
    },
  });
});

test('parseBlogPostInput fills a slug from the title when omitted', () => {
  const parsed = parseBlogPostInput({
    title: 'Personal development',
    excerpt: '',
    body: 'Hello',
    category: 'personal-development',
    status: 'draft',
  });

  assert.equal(parsed.ok, true);
  assert.equal(parsed.value.slug, 'personal-development');
  assert.equal(parsed.value.excerpt, '');
});

test('parseBlogPostInput rejects unknown categories and empty titles', () => {
  assert.equal(parseBlogPostInput({ title: '  ' }).ok, false);
  assert.equal(
    parseBlogPostInput({
      title: 'Hello',
      body: 'Body',
      category: 'health',
      status: 'draft',
    }).ok,
    false,
  );
});

test('parseBlogPostInput patch mode updates only provided fields', () => {
  const parsed = parseBlogPostInput(
    { status: 'published', category: 'technology' },
    { required: false },
  );

  assert.deepEqual(parsed, {
    ok: true,
    value: {
      category: 'technology',
      status: 'published',
    },
  });
});

test('parseBlogCategoryQuery accepts known slugs or an empty filter', () => {
  assert.deepEqual(parseBlogCategoryQuery(undefined), { ok: true, category: null });
  assert.deepEqual(parseBlogCategoryQuery('personal-development'), {
    ok: true,
    category: 'personal-development',
  });
  assert.equal(parseBlogCategoryQuery('health').ok, false);
});
