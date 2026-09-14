import express from 'express';
import { requireAdmin, requireAuth } from '../auth/auth.middleware.js';
import {
  deleteAdminPost,
  getAdminPost,
  getAdminPosts,
  getPublishedPost,
  getPublishedPosts,
  patchAdminPost,
  postAdminPost,
} from './blogPosts.controller.js';

const router = express.Router();

router.get('/posts', getPublishedPosts);
router.get('/posts/:slug', getPublishedPost);
router.get('/admin/posts', requireAuth, requireAdmin, getAdminPosts);
router.get('/admin/posts/:slug', requireAuth, requireAdmin, getAdminPost);
router.post('/admin/posts', requireAuth, requireAdmin, postAdminPost);
router.patch('/admin/posts/:slug', requireAuth, requireAdmin, patchAdminPost);
router.delete('/admin/posts/:slug', requireAuth, requireAdmin, deleteAdminPost);

export default router;
