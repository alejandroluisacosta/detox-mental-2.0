import express from 'express';
import { login, verify, logout } from './auth.controller.js';

const router = express.Router();

router.post('/login', login);
router.get('/verify', verify);
router.post('/logout', logout);

export default router;
