import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createBlogImage,
  createBlogPost,
  getAdminBlogPostBySlug,
  getBlogImage,
  getPublishedBlogPostBySlug,
  listPublishedBlogPosts,
  updateBlogPost,
} from './blogPosts.service.js';

const NOW = new Date('2026-09-15T12:00:00.000Z');

const draftFields = {
  slug: 'quiet-tools',
  title: 'Quiet tools',
  excerpt: 'A draft excerpt.',
  body: 'Draft body.',
  category: 'technology',
  status: 'draft',
};

const publishedFields = {
  slug: 'attention-is-a-vote',
  title: 'Attention is a vote',
  excerpt: 'A published excerpt.',
  body: 'Published body.',
  category: 'personal-development',
  status: 'published',
};

const memoryDb = () => {
  const rows = [];
  let nextId = 1;

  return {
    async query(sql, params = []) {
      const text = sql.replace(/\s+/g, ' ');

      if (/INSERT INTO blog_posts/.test(text)) {
        const [slug, title, excerpt, body, category, status, authorId, publishedAt] =
          params;
        if (rows.some((row) => row.slug === slug)) {
          const err = new Error('duplicate slug');
          err.code = '23505';
          throw err;
        }
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
          created_at: NOW,
          updated_at: NOW,
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
        if (rows.some((row, rowIndex) => rowIndex !== index && row.slug === slug)) {
          const err = new Error('duplicate slug');
          err.code = '23505';
          throw err;
        }
        rows[index] = {
          ...rows[index],
          slug,
          title,
          excerpt,
          body,
          category,
          status,
          published_at: publishedAt,
          updated_at: NOW,
        };
        return { rows: [rows[index]] };
      }

      if (/DELETE FROM blog_posts/.test(text)) {
        const index = rows.findIndex((row) => row.slug === params[0]);
        if (index === -1) return { rows: [] };
        const [removed] = rows.splice(index, 1);
        return { rows: [{ id: removed.id }] };
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
        const category = params[0];
        const published = rows.filter((row) => {
          if (row.status !== 'published') return false;
          return category == null || row.category === category;
        });
        published.sort((a, b) => {
          const aTime = new Date(a.published_at || 0).getTime();
          const bTime = new Date(b.published_at || 0).getTime();
          return bTime - aTime;
        });
        return { rows: published };
      }

      const listed = [...rows].sort((a, b) => {
        const aTime = new Date(a.published_at || a.created_at || 0).getTime();
        const bTime = new Date(b.published_at || b.created_at || 0).getTime();
        return bTime - aTime;
      });
      return { rows: listed };
    },
  };
};

test('the public list never returns a draft row or a status field', async () => {
  const db = memoryDb();
  await createBlogPost(draftFields, 'author-1', db);
  await createBlogPost(publishedFields, 'author-1', db);

  const posts = await listPublishedBlogPosts(null, db);

  assert.equal(posts.length, 1);
  assert.equal(posts[0].slug, publishedFields.slug);
  assert.equal('status' in posts[0], false);
});

test('first publish sets published_at', async () => {
  const db = memoryDb();
  const draft = await createBlogPost(draftFields, 'author-1', db);

  assert.equal(draft.publishedAt, null);

  const published = await updateBlogPost(draft.slug, { status: 'published' }, db);

  assert.equal(published.status, 'published');
  assert.ok(published.publishedAt instanceof Date);
});

test('unpublish sets status to draft and preserves published_at', async () => {
  const db = memoryDb();
  const published = await createBlogPost(publishedFields, 'author-1', db);
  const publishedAt = published.publishedAt;

  const unpublished = await updateBlogPost(published.slug, { status: 'draft' }, db);

  assert.equal(unpublished.status, 'draft');
  assert.equal(unpublished.publishedAt, publishedAt);
  assert.equal(await getPublishedBlogPostBySlug(published.slug, db), null);
});

test('createBlogImage returns a public url and getBlogImage reads the same bytes', async () => {
  const bytes = Buffer.from([0xff, 0xd8, 0xff, 0x11]);
  const db = {
    async query(sql, params = []) {
      const text = sql.replace(/\s+/g, ' ');
      if (/INSERT INTO blog_images/.test(text)) {
        return {
          rows: [{ id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', mime_type: params[1] }],
        };
      }
      if (/FROM blog_images/.test(text)) {
        assert.equal(params[0], 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee');
        return {
          rows: [
            {
              id: params[0],
              mime_type: 'image/jpeg',
              bytes,
            },
          ],
        };
      }
      return { rows: [] };
    },
  };

  const created = await createBlogImage(
    { authorId: 'author-1', mimeType: 'image/jpeg', bytes },
    db,
  );
  assert.equal(created.url, '/blog/images/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee');

  const loaded = await getBlogImage(created.id, db);
  assert.equal(loaded.mimeType, 'image/jpeg');
  assert.deepEqual(loaded.bytes, bytes);
});

test('getBlogImage returns null when the id is missing', async () => {
  const storedId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
  const db = {
    async query(sql, params = []) {
      if (params[0] === storedId) {
        return {
          rows: [{ id: storedId, mime_type: 'image/jpeg', bytes: Buffer.from([1]) }],
        };
      }
      return { rows: [] };
    },
  };

  assert.equal(await getBlogImage('bbbbbbbb-cccc-dddd-eeee-ffffffffffff', db), null);
});

test('a slug rename updates the row addressed by the old slug', async () => {
  const db = memoryDb();
  const created = await createBlogPost(draftFields, 'author-1', db);

  const renamed = await updateBlogPost(created.slug, { slug: 'renamed-tools' }, db);

  assert.equal(renamed.slug, 'renamed-tools');
  assert.equal(renamed.id, created.id);
  assert.equal(await getAdminBlogPostBySlug(created.slug, db), null);
  assert.equal((await getAdminBlogPostBySlug('renamed-tools', db)).id, created.id);
});
