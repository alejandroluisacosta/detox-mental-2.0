import { Router } from 'express';
import { postFirstReflection } from './journalFirstReflection.controller.js';

const router = Router();
router.post('/', postFirstReflection);

export default router;
