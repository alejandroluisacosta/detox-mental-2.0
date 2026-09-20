import { describe, expect, test, vi } from 'vitest';
import { BLOG_REVIEW_SAMPLE_SLUG, isBlogPreviewReview } from './blogPreviewReview.js';

describe('isBlogPreviewReview', () => {
  test('is off outside Vercel preview builds', () => {
    expect(isBlogPreviewReview()).toBe(false);
  });

  test('is on when the build is a Vercel preview', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_VERCEL_ENV', 'preview');
    const { isBlogPreviewReview: isPreview } = await import('./blogPreviewReview.js');
    expect(isPreview()).toBe(true);
    expect(BLOG_REVIEW_SAMPLE_SLUG).toBe('review-sample');
    vi.unstubAllEnvs();
    vi.resetModules();
  });
});
