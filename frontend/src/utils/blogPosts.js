export const filterBlogPosts = (posts, category) => {
  const list = Array.isArray(posts) ? posts : [];
  if (!category) return list;
  return list.filter((post) => post.category === category);
};

export const mergeBlogPosts = (remote, fallback) => {
  const bySlug = new Map();
  for (const post of fallback ?? []) {
    if (post?.slug) bySlug.set(post.slug, post);
  }
  for (const post of remote ?? []) {
    if (post?.slug) bySlug.set(post.slug, post);
  }
  return [...bySlug.values()].sort((a, b) => {
    const aTime = new Date(a.publishedAt || a.createdAt || 0).getTime();
    const bTime = new Date(b.publishedAt || b.createdAt || 0).getTime();
    return bTime - aTime;
  });
};

export const findBlogPost = (posts, slug) =>
  (Array.isArray(posts) ? posts : []).find((post) => post.slug === slug) ?? null;
