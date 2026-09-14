export const BLOG_CATEGORIES = [
  {
    slug: 'personal-development',
    label: 'Personal development',
  },
  {
    slug: 'technology',
    label: 'Technology',
  },
];

export const blogCategoryLabel = (slug) =>
  BLOG_CATEGORIES.find((category) => category.slug === slug)?.label ?? slug;
