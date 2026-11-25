import {
  createJournalEntry,
  listJournalEntriesForUser,
  listJournalEntriesInWindowForUser,
  deleteJournalEntryForUser,
  updateJournalEntryTopicsForUser,
} from './journalEntries.service.js';
import pool from '../db/db.js';
import { listCustomTopicsForUser } from '../journalTopics/journalTopics.service.js';
import { journalMessage } from '../i18n/journalMessages.js';
import { localeFromRequest } from '../i18n/locale.js';
import {
  memoryLookupDates,
  parseIsoDate,
  utcDateOf,
  utcDayWindow,
} from './journalMemoryDates.js';

export const ALLOWED_JOURNAL_TOPICS = [
  'work',
  'interpersonal',
  'reflection',
  'wisdom',
  'worries',
  'meditations',
  'private',
];

const MAX_TOPICS = 3;
// Bounds storage and the text each weekly summary sends to the model.
export const MAX_ENTRY_CHARS = 10000;

const parseTopics = async (raw, locale, userId) => {
  if (raw === undefined || raw === null) {
    return { ok: true, topics: [] };
  }

  if (!Array.isArray(raw)) {
    return { ok: false, message: journalMessage(locale, 'topicsMustBeList') };
  }

  if (raw.length > MAX_TOPICS) {
    return {
      ok: false,
      message: journalMessage(locale, 'tooManyTopics', { max: MAX_TOPICS }),
    };
  }

  const custom = await listCustomTopicsForUser(userId);
  const allowed = new Set([
    ...ALLOWED_JOURNAL_TOPICS,
    ...custom.map((topic) => topic.name),
  ]);

  const topics = [];
  for (const item of raw) {
    if (typeof item !== 'string' || !allowed.has(item)) {
      return { ok: false, message: journalMessage(locale, 'invalidTopic') };
    }
    if (topics.includes(item)) {
      return { ok: false, message: journalMessage(locale, 'duplicateTopic') };
    }
    topics.push(item);
  }

  return { ok: true, topics };
};

export const getJournalEntries = async (req, res) => {
  const locale = localeFromRequest(req);
  const rawTopic = req.query?.topic;
  let filter = null;

  if (rawTopic !== undefined) {
    if (typeof rawTopic !== 'string' || rawTopic !== 'meditations') {
      return res.status(400).json({ message: journalMessage(locale, 'invalidTopic') });
    }
    filter = { topic: 'meditations' };
  }

  try {
    const entries = filter
      ? await listJournalEntriesForUser(req.user.id, pool, filter)
      : await listJournalEntriesForUser(req.user.id);
    return res.status(200).json({ entries });
  } catch (err) {
    console.error('[journal-entries GET]', err);
    return res.status(500).json({ message: journalMessage(locale, 'entriesLoadFailed') });
  }
};

export const postJournalEntry = async (req, res) => {
  const locale = localeFromRequest(req);
  const raw = req.body?.content;
  const content = typeof raw === 'string' ? raw.trim() : '';

  if (!content) {
    return res.status(400).json({ message: journalMessage(locale, 'emptyContent') });
  }

  if (content.length > MAX_ENTRY_CHARS) {
    return res.status(400).json({
      message: journalMessage(locale, 'contentTooLong', { max: MAX_ENTRY_CHARS }),
    });
  }

  try {
    const parsedTopics = await parseTopics(req.body?.topics, locale, req.user.id);
    if (!parsedTopics.ok) {
      return res.status(400).json({ message: parsedTopics.message });
    }

    const entry = await createJournalEntry(req.user.id, content, parsedTopics.topics);
    return res.status(201).json({ entry });
  } catch (err) {
    console.error('[journal-entries POST]', err);
    return res.status(500).json({ message: journalMessage(locale, 'saveFailed') });
  }
};

export const deleteJournalEntry = async (req, res) => {
  const locale = localeFromRequest(req);
  const entryId = typeof req.params.id === 'string' ? req.params.id.trim() : '';

  if (!entryId) {
    return res.status(400).json({ message: journalMessage(locale, 'invalidEntryId') });
  }

  try {
    const deletedId = await deleteJournalEntryForUser(req.user.id, entryId);
    if (!deletedId) {
      return res.status(404).json({ message: journalMessage(locale, 'entryNotFound') });
    }
    return res.status(204).send();
  } catch (err) {
    console.error('[journal-entries DELETE]', err);
    return res.status(500).json({ message: journalMessage(locale, 'deleteFailed') });
  }
};

export const patchJournalEntryTopics = async (req, res) => {
  const locale = localeFromRequest(req);
  const entryId = typeof req.params.id === 'string' ? req.params.id.trim() : '';

  if (!entryId) {
    return res.status(400).json({ message: journalMessage(locale, 'invalidEntryId') });
  }

  if (!Object.hasOwn(req.body ?? {}, 'topics')) {
    return res.status(400).json({ message: journalMessage(locale, 'topicsMustBeList') });
  }

  try {
    const parsedTopics = await parseTopics(req.body.topics, locale, req.user.id);
    if (!parsedTopics.ok) {
      return res.status(400).json({ message: parsedTopics.message });
    }

    const entry = await updateJournalEntryTopicsForUser(
      req.user.id,
      entryId,
      parsedTopics.topics,
    );
    if (!entry) {
      return res.status(404).json({ message: journalMessage(locale, 'entryNotFound') });
    }
    return res.status(200).json({ entry });
  } catch (err) {
    console.error('[journal-entries PATCH]', err);
    return res.status(500).json({ message: journalMessage(locale, 'topicsUpdateFailed') });
  }
};

/**
 * Picks "today" as a UTC date. Outside production `?date=YYYY-MM-DD` overrides
 * it so anniversaries can be tested without waiting for one.
 */
const memoryToday = (req) => {
  const now = req.now ?? new Date();
  const raw = req.query?.date;
  if (process.env.NODE_ENV === 'production' || raw === undefined) {
    return { ok: true, today: utcDateOf(now) };
  }
  const today = parseIsoDate(raw);
  return today ? { ok: true, today } : { ok: false };
};

export const getJournalMemory = async (req, res) => {
  const locale = localeFromRequest(req);
  const resolved = memoryToday(req);
  if (!resolved.ok) {
    return res.status(400).json({ message: journalMessage(locale, 'memoryDateInvalid') });
  }

  const { today } = resolved;
  const db = req.db ?? pool;
  try {
    for (const { horizon, date } of memoryLookupDates(today)) {
      const { start, end } = utcDayWindow(date);
      const entries = await listJournalEntriesInWindowForUser(req.user.id, start, end, db);
      if (entries.length > 0) {
        return res.status(200).json({ today, memory: { horizon, date, entries } });
      }
    }
    return res.status(200).json({ today, memory: null });
  } catch (err) {
    console.error('[journal-memory GET]', err);
    return res.status(500).json({ message: journalMessage(locale, 'memoryLoadFailed') });
  }
};
