import express from 'express';
import { login, verify, logout, me } from './auth.controller.js';
import {
  getSessionUnblocks,
  postSessionUnblock,
} from '../sessionUnblocks/sessionUnblocks.controller.js';
import {
  getJournalEntries,
  postJournalEntry,
} from '../journalEntries/journalEntries.controller.js';
import { requireAuth } from './auth.middleware.js';

const router = express.Router();

router.post('/login', login);
router.get('/verify', verify);
router.post('/logout', logout);
router.get('/me/unblocked-sessions', requireAuth, getSessionUnblocks);
router.post('/me/unblocked-sessions', requireAuth, postSessionUnblock);
router.get('/me/journal-entries', requireAuth, getJournalEntries);
router.post('/me/journal-entries', requireAuth, postJournalEntry);
router.get('/me', requireAuth, me);

export default router;
