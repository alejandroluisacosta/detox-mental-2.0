export const BLOG_REVIEW_SAMPLE_SLUG = 'review-sample';

export const BLOG_REVIEW_SAMPLE_IMAGE_SRC = '/images/socrates.webp';

export const isBlogPreviewReview = () => import.meta.env.VITE_VERCEL_ENV === 'preview';

export const BLOG_REVIEW_SAMPLE_POST = {
  id: 'preview-review-sample',
  slug: BLOG_REVIEW_SAMPLE_SLUG,
  title: 'Preview sample',
  excerpt: 'A sample article for reviewing this deployment without an admin account.',
  category: 'technology',
  publishedAt: '2026-09-20T12:00:00.000Z',
  status: 'published',
  body: `This preview includes an image so you can check layout without signing in.

![Socrates](${BLOG_REVIEW_SAMPLE_IMAGE_SRC})

You can also review **bold**, *italic*, and [links](https://example.com).
`,
};
