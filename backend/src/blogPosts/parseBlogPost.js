export const BLOG_STATUSES = ['draft', 'published'];
export const BLOG_CATEGORIES = ['personal-development', 'technology'];

export const MAX_TITLE_LENGTH = 200;
export const MAX_SLUG_LENGTH = 120;
export const MAX_EXCERPT_LENGTH = 500;

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const suggestBlogSlug = (title) => {
  if (typeof title !== 'string') return '';
  return title
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/g, '');
};

const readString = (raw, key) => {
  if (!Object.hasOwn(raw, key)) return undefined;
  return typeof raw[key] === 'string' ? raw[key].trim() : '';
};

export const parseBlogPostInput = (raw, { required = true } = {}) => {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, message: 'Invalid post.' };
  }

  const value = {};

  const title = readString(raw, 'title');
  if (required || title !== undefined) {
    if (!title) return { ok: false, message: 'Title is required.' };
    if (title.length > MAX_TITLE_LENGTH) {
      return { ok: false, message: 'Title is too long.' };
    }
    value.title = title;
  }

  const slugInput = readString(raw, 'slug');
  if (required || slugInput !== undefined) {
    const slug = slugInput || suggestBlogSlug(value.title || '');
    if (!slug || !SLUG_PATTERN.test(slug) || slug.length > MAX_SLUG_LENGTH) {
      return { ok: false, message: 'Slug is invalid.' };
    }
    value.slug = slug;
  }

  const excerpt = readString(raw, 'excerpt');
  if (required || excerpt !== undefined) {
    if (excerpt === undefined) {
      value.excerpt = '';
    } else if (excerpt.length > MAX_EXCERPT_LENGTH) {
      return { ok: false, message: 'Excerpt is too long.' };
    } else {
      value.excerpt = excerpt;
    }
  }

  const body = readString(raw, 'body');
  if (required || body !== undefined) {
    if (!body) return { ok: false, message: 'Body is required.' };
    value.body = body;
  }

  const category = readString(raw, 'category');
  if (required || category !== undefined) {
    if (!BLOG_CATEGORIES.includes(category)) {
      return { ok: false, message: 'Category is invalid.' };
    }
    value.category = category;
  }

  const status = readString(raw, 'status');
  if (required || status !== undefined) {
    const resolved = status || 'draft';
    if (!BLOG_STATUSES.includes(resolved)) {
      return { ok: false, message: 'Status is invalid.' };
    }
    value.status = resolved;
  }

  if (!required && Object.keys(value).length === 0) {
    return { ok: false, message: 'No fields to update.' };
  }

  return { ok: true, value };
};

export const parseBlogCategoryQuery = (raw) => {
  if (raw == null || raw === '') return { ok: true, category: null };
  if (typeof raw !== 'string' || !BLOG_CATEGORIES.includes(raw)) {
    return { ok: false, message: 'Category is invalid.' };
  }
  return { ok: true, category: raw };
};
