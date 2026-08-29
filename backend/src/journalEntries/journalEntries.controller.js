import {
  createJournalEntry,
  listJournalEntriesForUser,
  deleteJournalEntryForUser,
  updateJournalEntryTopicsForUser,
} from './journalEntries.service.js';
import { journalMessage } from '../i18n/journalMessages.js';
import { localeFromRequest } from '../i18n/locale.js';

export const ALLOWED_JOURNAL_TOPICS = [
  'Trabajo',
  'Interpersonal',
  'Reflexión',
  'Sabiduría',
  'Preocupaciones',
  'Meditaciones',
  'Privado',
];

const MAX_TOPICS = 3;

const parseTopics = (raw, locale) => {
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

  const topics = [];
  for (const item of raw) {
    if (typeof item !== 'string' || !ALLOWED_JOURNAL_TOPICS.includes(item)) {
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
  try {
    const entries = await listJournalEntriesForUser(req.user.id);
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

  const parsedTopics = parseTopics(req.body?.topics, locale);
  if (!parsedTopics.ok) {
    return res.status(400).json({ message: parsedTopics.message });
  }

  try {
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

  const parsedTopics = parseTopics(req.body.topics, locale);
  if (!parsedTopics.ok) {
    return res.status(400).json({ message: parsedTopics.message });
  }

  try {
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
