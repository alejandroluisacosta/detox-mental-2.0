import express from 'express';
import { login, verify, logout, me } from './auth.controller.js';
import {
  getSessionUnblocks,
  postSessionUnblock,
} from '../sessionUnblocks/sessionUnblocks.controller.js';
import {
  getJournalEntries,
  postJournalEntry,
  deleteJournalEntry,
  patchJournalEntryTopics,
} from '../journalEntries/journalEntries.controller.js';
import {
  getCustomTopics,
  postCustomTopic,
  patchCustomTopic,
} from '../journalTopics/journalTopics.controller.js';
import {
  uploadJournalImage,
  postJournalTranscription,
} from '../journalTranscription/journalTranscription.controller.js';
import {
  getCurrentJournalSummary,
  postCurrentJournalSummary,
} from '../journalSummaries/journalSummaries.controller.js';
import { requireAuth } from './auth.middleware.js';

const router = express.Router();

router.post('/login', login);
router.get('/verify', verify);
router.post('/logout', logout);
router.get('/me/unblocked-sessions', requireAuth, getSessionUnblocks);
router.post('/me/unblocked-sessions', requireAuth, postSessionUnblock);
router.get('/me/journal-entries', requireAuth, getJournalEntries);
router.post('/me/journal-entries', requireAuth, postJournalEntry);
router.delete('/me/journal-entries/:id', requireAuth, deleteJournalEntry);
router.patch('/me/journal-entries/:id', requireAuth, patchJournalEntryTopics);
router.get('/me/journal-topics', requireAuth, getCustomTopics);
router.post('/me/journal-topics', requireAuth, postCustomTopic);
router.patch('/me/journal-topics/:id', requireAuth, patchCustomTopic);
router.post(
  '/me/journal-entries/transcribe',
  requireAuth,
  uploadJournalImage,
  postJournalTranscription,
);
router.get(
  '/me/journal-summaries/current',
  requireAuth,
  getCurrentJournalSummary,
);
router.post(
  '/me/journal-summaries/current',
  requireAuth,
  postCurrentJournalSummary,
);
router.get('/me', requireAuth, me);

export default router;
