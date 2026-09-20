import express from 'express';
import { requireAdmin, requireAuth } from '../auth/auth.middleware.js';
import {
  deleteAdminPost,
  getAdminPost,
  getAdminPosts,
  getPublicImage,
  getPublishedPost,
  getPublishedPosts,
  patchAdminPost,
  postAdminImage,
  postAdminPost,
  uploadBlogImage,
} from './blogPosts.controller.js';

const router = express.Router();

router.get('/posts', getPublishedPosts);
router.get('/posts/:slug', getPublishedPost);
router.get('/images/:id', getPublicImage);
router.get('/admin/posts', requireAuth, requireAdmin, getAdminPosts);
router.get('/admin/posts/:slug', requireAuth, requireAdmin, getAdminPost);
router.post('/admin/posts', requireAuth, requireAdmin, postAdminPost);
router.patch('/admin/posts/:slug', requireAuth, requireAdmin, patchAdminPost);
router.delete('/admin/posts/:slug', requireAuth, requireAdmin, deleteAdminPost);
router.post(
  '/admin/images',
  requireAuth,
  requireAdmin,
  uploadBlogImage,
  postAdminImage,
);

export default router;
