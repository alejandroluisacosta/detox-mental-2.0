import {
  parseBlogCategoryQuery,
  parseBlogPostInput,
} from './parseBlogPost.js';
import {
  createBlogPost,
  deleteBlogPost,
  getAdminBlogPostBySlug,
  getPublishedBlogPostBySlug,
  listAdminBlogPosts,
  listPublishedBlogPosts,
  updateBlogPost,
} from './blogPosts.service.js';

const readSlug = (req) =>
  typeof req.params.slug === 'string' ? req.params.slug.trim() : '';

export const getPublishedPosts = async (req, res) => {
  const parsedCategory = parseBlogCategoryQuery(req.query?.category);
  if (!parsedCategory.ok) {
    return res.status(400).json({ message: parsedCategory.message });
  }

  try {
    const posts = await listPublishedBlogPosts(parsedCategory.category);
    return res.status(200).json({ posts });
  } catch (err) {
    console.error('[blog-posts GET]', err);
    return res.status(500).json({ message: 'Could not load posts.' });
  }
};

export const getPublishedPost = async (req, res) => {
  const slug = readSlug(req);
  if (!slug) {
    return res.status(404).json({ message: 'Not found.' });
  }

  try {
    const post = await getPublishedBlogPostBySlug(slug);
    if (!post) {
      return res.status(404).json({ message: 'Not found.' });
    }
    return res.status(200).json({ post });
  } catch (err) {
    console.error('[blog-posts GET slug]', err);
    return res.status(500).json({ message: 'Could not load post.' });
  }
};

export const getAdminPosts = async (_req, res) => {
  try {
    const posts = await listAdminBlogPosts();
    return res.status(200).json({ posts });
  } catch (err) {
    console.error('[blog-posts admin GET]', err);
    return res.status(500).json({ message: 'Could not load posts.' });
  }
};

export const getAdminPost = async (req, res) => {
  const slug = readSlug(req);
  if (!slug) {
    return res.status(404).json({ message: 'Not found.' });
  }

  try {
    const post = await getAdminBlogPostBySlug(slug);
    if (!post) {
      return res.status(404).json({ message: 'Not found.' });
    }
    return res.status(200).json({ post });
  } catch (err) {
    console.error('[blog-posts admin GET slug]', err);
    return res.status(500).json({ message: 'Could not load post.' });
  }
};

export const postAdminPost = async (req, res) => {
  const parsed = parseBlogPostInput(req.body);
  if (!parsed.ok) {
    return res.status(400).json({ message: parsed.message });
  }

  try {
    const post = await createBlogPost(parsed.value, req.user.id);
    return res.status(201).json({ post });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Slug already exists.' });
    }
    console.error('[blog-posts admin POST]', err);
    return res.status(500).json({ message: 'Could not save post.' });
  }
};

export const patchAdminPost = async (req, res) => {
  const slug = readSlug(req);
  if (!slug) {
    return res.status(404).json({ message: 'Not found.' });
  }

  const parsed = parseBlogPostInput(req.body, { required: false });
  if (!parsed.ok) {
    return res.status(400).json({ message: parsed.message });
  }

  try {
    const post = await updateBlogPost(slug, parsed.value);
    if (!post) {
      return res.status(404).json({ message: 'Not found.' });
    }
    return res.status(200).json({ post });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Slug already exists.' });
    }
    console.error('[blog-posts admin PATCH]', err);
    return res.status(500).json({ message: 'Could not save post.' });
  }
};

export const deleteAdminPost = async (req, res) => {
  const slug = readSlug(req);
  if (!slug) {
    return res.status(404).json({ message: 'Not found.' });
  }

  try {
    const deletedId = await deleteBlogPost(slug);
    if (!deletedId) {
      return res.status(404).json({ message: 'Not found.' });
    }
    return res.status(204).send();
  } catch (err) {
    console.error('[blog-posts admin DELETE]', err);
    return res.status(500).json({ message: 'Could not delete post.' });
  }
};
