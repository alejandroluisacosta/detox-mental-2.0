import express from 'express';
import { login, verify, logout, me } from './auth.controller.js';
import { requireAuth } from './auth.middleware.js';

const router = express.Router();

router.post('/login', login);
router.get('/verify', verify);
router.post('/logout', logout);
router.get('/me', requireAuth, me);

export default router;
