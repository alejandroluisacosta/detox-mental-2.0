import multer from 'multer';
import pool from '../db/db.js';
import {
  parseBlogCategoryQuery,
  parseBlogPostInput,
} from './parseBlogPost.js';
import {
  MAX_BLOG_IMAGE_BYTES,
  parseBlogImageId,
  parseBlogImageUpload,
} from './parseBlogImage.js';
import {
  createBlogImage,
  createBlogPost,
  deleteBlogPost,
  getAdminBlogPostBySlug,
  getBlogImage,
  getPublishedBlogPostBySlug,
  listAdminBlogPosts,
  listPublishedBlogPosts,
  updateBlogPost,
} from './blogPosts.service.js';

const dbFor = (req) => req.db ?? pool;

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BLOG_IMAGE_BYTES, files: 1 },
});

export const uploadBlogImage = (req, res, next) => {
  imageUpload.single('image')(req, res, (err) => {
    if (err) {
      const message =
        err.code === 'LIMIT_FILE_SIZE'
          ? 'The image is too large (maximum 5 MB).'
          : 'Could not process the image.';
      return res.status(400).json({ message });
    }
    return next();
  });
};

const readSlug = (req) =>
  typeof req.params.slug === 'string' ? req.params.slug.trim() : '';

export const getPublishedPosts = async (req, res) => {
  const parsedCategory = parseBlogCategoryQuery(req.query?.category);
  if (!parsedCategory.ok) {
    return res.status(400).json({ message: parsedCategory.message });
  }

  try {
    const posts = await listPublishedBlogPosts(parsedCategory.category, dbFor(req));
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
    const post = await getPublishedBlogPostBySlug(slug, dbFor(req));
    if (!post) {
      return res.status(404).json({ message: 'Not found.' });
    }
    return res.status(200).json({ post });
  } catch (err) {
    console.error('[blog-posts GET slug]', err);
    return res.status(500).json({ message: 'Could not load post.' });
  }
};

export const getAdminPosts = async (req, res) => {
  try {
    const posts = await listAdminBlogPosts(dbFor(req));
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
    const post = await getAdminBlogPostBySlug(slug, dbFor(req));
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
    const post = await createBlogPost(parsed.value, req.user.id, dbFor(req));
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
    const post = await updateBlogPost(slug, parsed.value, dbFor(req));
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

export const getPublicImage = async (req, res) => {
  const parsed = parseBlogImageId(req.params?.id);
  if (!parsed.ok) {
    return res.status(404).json({ message: 'Not found.' });
  }

  try {
    const image = await getBlogImage(parsed.id, dbFor(req));
    if (!image) {
      return res.status(404).json({ message: 'Not found.' });
    }
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.type(image.mimeType);
    return res.send(image.bytes);
  } catch (err) {
    console.error('[blog-images GET]', err);
    return res.status(500).json({ message: 'Could not load image.' });
  }
};

export const postAdminImage = async (req, res) => {
  const parsed = parseBlogImageUpload(req.file);
  if (!parsed.ok) {
    return res.status(400).json({ message: parsed.message });
  }

  try {
    const image = await createBlogImage(
      {
        authorId: req.user.id,
        mimeType: parsed.mimeType,
        bytes: parsed.bytes,
      },
      dbFor(req),
    );
    return res.status(201).json({ image: { id: image.id, url: image.url } });
  } catch (err) {
    console.error('[blog-images admin POST]', err);
    return res.status(500).json({ message: 'Could not save image.' });
  }
};

export const deleteAdminPost = async (req, res) => {
  const slug = readSlug(req);
  if (!slug) {
    return res.status(404).json({ message: 'Not found.' });
  }

  try {
    const deletedId = await deleteBlogPost(slug, dbFor(req));
    if (!deletedId) {
      return res.status(404).json({ message: 'Not found.' });
    }
    return res.status(204).send();
  } catch (err) {
    console.error('[blog-posts admin DELETE]', err);
    return res.status(500).json({ message: 'Could not delete post.' });
  }
};
