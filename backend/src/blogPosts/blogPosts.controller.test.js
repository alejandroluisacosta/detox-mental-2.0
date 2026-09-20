import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getPublishedPost,
  getPublishedPosts,
  patchAdminPost,
  postAdminPost,
} from './blogPosts.controller.js';

const mockRes = () => {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      res.statusCode = code;
      return res;
    },
    json(payload) {
      res.body = payload;
      return res;
    },
  };
  throw new Error('ci fail');
};

const memoryDb = () => {
  const rows = [];
  let nextId = 1;
  const now = new Date('2026-09-15T12:00:00.000Z');

  return {
    async query(sql, params = []) {
      const text = sql.replace(/\s+/g, ' ');

      if (/INSERT INTO blog_posts/.test(text)) {
        const [slug, title, excerpt, body, category, status, authorId, publishedAt] =
          params;
        const row = {
          id: `post-${nextId}`,
          slug,
          title,
          excerpt,
          body,
          category,
          status,
          author_id: authorId,
          published_at: publishedAt,
          created_at: now,
          updated_at: now,
        };
        nextId += 1;
        rows.push(row);
        return { rows: [row] };
      }

      if (/UPDATE blog_posts/.test(text)) {
        const [currentSlug, slug, title, excerpt, body, category, status, publishedAt] =
          params;
        const index = rows.findIndex((row) => row.slug === currentSlug);
        if (index === -1) return { rows: [] };
        rows[index] = {
          ...rows[index],
          slug,
          title,
          excerpt,
          body,
          category,
          status,
          published_at: publishedAt,
          updated_at: now,
        };
        return { rows: [rows[index]] };
      }

      if (/WHERE slug = \$1 AND status = 'published'/.test(text)) {
        const found = rows.find(
          (row) => row.slug === params[0] && row.status === 'published',
        );
        return { rows: found ? [found] : [] };
      }

      if (/WHERE slug = \$1/.test(text)) {
        const found = rows.find((row) => row.slug === params[0]);
        return { rows: found ? [found] : [] };
      }

      if (/WHERE status = 'published'/.test(text)) {
        return {
          rows: rows.filter((row) => row.status === 'published'),
        };
      }

      return { rows: [...rows] };
    },
  };
};

test('unknown category query is 400 before a list is loaded', async () => {
  const res = mockRes();
  await getPublishedPosts({ query: { category: 'not-a-category' } }, res);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, 'Category is invalid.');
});

test('an empty public slug is 404', async () => {
  const res = mockRes();
  await getPublishedPost({ params: { slug: '   ' } }, res);
  assert.equal(res.statusCode, 404);
  assert.deepEqual(res.body, { message: 'Not found.' });
});

test('a draft is absent from public reads until it is published', async () => {
  const db = memoryDb();
  const fields = {
    slug: 'quiet-tools',
    title: 'Quiet tools',
    excerpt: 'A draft excerpt.',
    body: 'Draft body.',
    category: 'technology',
    status: 'draft',
  };

  const created = mockRes();
  await postAdminPost({ db, user: { id: 'author-1' }, body: fields }, created);
  assert.equal(created.statusCode, 201);
  assert.equal(created.body.post.status, 'draft');

  const listedWhileDraft = mockRes();
  await getPublishedPosts({ db, query: {} }, listedWhileDraft);
  assert.equal(listedWhileDraft.statusCode, 200);
  assert.equal(
    listedWhileDraft.body.posts.some((post) => post.slug === fields.slug),
    false,
  );

  const missing = mockRes();
  await getPublishedPost({ db, params: { slug: fields.slug } }, missing);
  assert.equal(missing.statusCode, 404);

  const published = mockRes();
  await patchAdminPost(
    { db, params: { slug: fields.slug }, body: { status: 'published' } },
    published,
  );
  assert.equal(published.statusCode, 200);
  assert.equal(published.body.post.status, 'published');

  const listedAfterPublish = mockRes();
  await getPublishedPosts({ db, query: {} }, listedAfterPublish);
  assert.equal(
    listedAfterPublish.body.posts.some((post) => post.slug === fields.slug),
    true,
  );

  const found = mockRes();
  await getPublishedPost({ db, params: { slug: fields.slug } }, found);
  assert.equal(found.statusCode, 200);
  assert.equal(found.body.post.slug, fields.slug);
});
