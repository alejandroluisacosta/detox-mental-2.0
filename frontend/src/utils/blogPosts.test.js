import { describe, expect, test } from 'vitest';
import { filterBlogPosts, findBlogPost, mergeBlogPosts } from './blogPosts.js';

const personal = {
  slug: 'attention',
  category: 'personal-development',
  publishedAt: '2026-08-01T00:00:00.000Z',
};
const tech = {
  slug: 'phone',
  category: 'technology',
  publishedAt: '2026-09-01T00:00:00.000Z',
};

describe('filterBlogPosts', () => {
  test('returns every post when no category is selected', () => {
    expect(filterBlogPosts([personal, tech], '')).toEqual([personal, tech]);
  });

  test('keeps only the selected category', () => {
    expect(filterBlogPosts([personal, tech], 'technology')).toEqual([tech]);
  });
});

describe('mergeBlogPosts', () => {
  test('keeps fallback posts when the API is empty', () => {
    expect(mergeBlogPosts([], [personal, tech])).toEqual([tech, personal]);
  });

  test('lets remote posts override the same slug', () => {
    const updated = { ...tech, title: 'Updated' };
    expect(mergeBlogPosts([updated], [personal, tech])).toEqual([updated, personal]);
  });
});

describe('findBlogPost', () => {
  test('finds a post by slug', () => {
    expect(findBlogPost([personal, tech], 'phone')).toBe(tech);
    expect(findBlogPost([personal], 'missing')).toBeNull();
  });
});
