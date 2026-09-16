export const MAX_BLOG_SLUG_LENGTH = 120;

export const suggestBlogSlug = (title) => {
  if (typeof title !== 'string') return '';
  return title
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_BLOG_SLUG_LENGTH)
    .replace(/-+$/g, '');
};
