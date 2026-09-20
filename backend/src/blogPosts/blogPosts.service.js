import pool from '../db/db.js';

const mapPublicSummary = (row) => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  excerpt: row.excerpt,
  category: row.category,
  publishedAt: row.published_at,
});

const mapSummary = (row) => ({
  ...mapPublicSummary(row),
  status: row.status,
});

const mapPost = (row) => ({
  ...mapSummary(row),
  body: row.body,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const RETURNING_COLUMNS = `
  id, slug, title, excerpt, body, category, status, published_at, created_at, updated_at
`;

export const listPublishedBlogPosts = async (category = null, db = pool) => {
  const { rows } = await db.query(
    `SELECT id, slug, title, excerpt, category, published_at
     FROM blog_posts
     WHERE status = 'published'
       AND ($1::text IS NULL OR category = $1)
     ORDER BY published_at DESC NULLS LAST, created_at DESC`,
    [category],
  );
  return rows.map(mapPublicSummary);
};

export const getPublishedBlogPostBySlug = async (slug, db = pool) => {
  const { rows } = await db.query(
    `SELECT ${RETURNING_COLUMNS}
     FROM blog_posts
     WHERE slug = $1 AND status = 'published'`,
    [slug],
  );
  return rows[0] ? mapPost(rows[0]) : null;
};

export const listAdminBlogPosts = async (db = pool) => {
  const { rows } = await db.query(
    `SELECT ${RETURNING_COLUMNS}
     FROM blog_posts
     ORDER BY COALESCE(published_at, created_at) DESC`,
  );
  return rows.map(mapPost);
};

export const getAdminBlogPostBySlug = async (slug, db = pool) => {
  const { rows } = await db.query(
    `SELECT ${RETURNING_COLUMNS}
     FROM blog_posts
     WHERE slug = $1`,
    [slug],
  );
  return rows[0] ? mapPost(rows[0]) : null;
};

export const createBlogPost = async (fields, authorId, db = pool) => {
  const publishedAt = fields.status === 'published' ? new Date() : null;
  const { rows } = await db.query(
    `INSERT INTO blog_posts (
       slug, title, excerpt, body, category, status, author_id, published_at
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING ${RETURNING_COLUMNS}`,
    [
      fields.slug,
      fields.title,
      fields.excerpt,
      fields.body,
      fields.category,
      fields.status,
      authorId,
      publishedAt,
    ],
  );
  return mapPost(rows[0]);
};

export const updateBlogPost = async (currentSlug, fields, db = pool) => {
  const existing = await getAdminBlogPostBySlug(currentSlug, db);
  if (!existing) return null;

  const next = {
    slug: fields.slug ?? existing.slug,
    title: fields.title ?? existing.title,
    excerpt: fields.excerpt ?? existing.excerpt,
    body: fields.body ?? existing.body,
    category: fields.category ?? existing.category,
    status: fields.status ?? existing.status,
  };

  let publishedAt = existing.publishedAt;
  if (next.status === 'published' && !publishedAt) {
    publishedAt = new Date();
  }

  const { rows } = await db.query(
    `UPDATE blog_posts
     SET slug = $2,
         title = $3,
         excerpt = $4,
         body = $5,
         category = $6,
         status = $7,
         published_at = $8
     WHERE slug = $1
     RETURNING ${RETURNING_COLUMNS}`,
    [
      currentSlug,
      next.slug,
      next.title,
      next.excerpt,
      next.body,
      next.category,
      next.status,
      publishedAt,
    ],
  );
  return rows[0] ? mapPost(rows[0]) : null;
};

export const deleteBlogPost = async (slug, db = pool) => {
  const { rows } = await db.query(
    `DELETE FROM blog_posts
     WHERE slug = $1
     RETURNING id`,
    [slug],
  );
  return rows[0]?.id ?? null;
};

export const createBlogImage = async ({ authorId, mimeType, bytes }, db = pool) => {
  const { rows } = await db.query(
    `INSERT INTO blog_images (author_id, mime_type, bytes)
     VALUES ($1, $2, $3)
     RETURNING id, mime_type`,
    [authorId, mimeType, bytes],
  );
  const row = rows[0];
  return {
    id: row.id,
    mimeType: row.mime_type,
    url: `/blog/images/${row.id}`,
  };
};

export const getBlogImage = async (id, db = pool) => {
  const { rows } = await db.query(
    `SELECT id, mime_type, bytes
     FROM blog_images
     WHERE id = $1`,
    [id],
  );
  if (!rows[0]) return null;
  return {
    id: rows[0].id,
    mimeType: rows[0].mime_type,
    bytes: rows[0].bytes,
  };
};
