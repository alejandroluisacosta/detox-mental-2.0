import {
  countCustomTopicsForUser,
  createCustomTopic,
  listCustomTopicsForUser,
  renameCustomTopic,
} from './journalTopics.service.js';
import {
  MAX_CUSTOM_JOURNAL_TOPICS,
  MAX_TOPIC_NAME_LENGTH,
  parseTopicName,
} from './parseTopicName.js';
import { journalMessage } from '../i18n/journalMessages.js';
import { localeFromRequest } from '../i18n/locale.js';

const nameError = (locale, messageKey) =>
  journalMessage(locale, messageKey, { max: MAX_TOPIC_NAME_LENGTH });

export const getCustomTopics = async (req, res) => {
  const locale = localeFromRequest(req);
  try {
    const topics = await listCustomTopicsForUser(req.user.id);
    return res.status(200).json({ topics });
  } catch (err) {
    console.error('[journal-topics GET]', err);
    return res.status(500).json({ message: journalMessage(locale, 'topicsLoadFailed') });
  }
};

export const postCustomTopic = async (req, res) => {
  const locale = localeFromRequest(req);
  const parsed = parseTopicName(req.body?.name);
  if (!parsed.ok) {
    return res.status(400).json({ message: nameError(locale, parsed.messageKey) });
  }

  try {
    const count = await countCustomTopicsForUser(req.user.id);
    if (count >= MAX_CUSTOM_JOURNAL_TOPICS) {
      return res.status(400).json({
        message: journalMessage(locale, 'tooManyCustomTopics', {
          max: MAX_CUSTOM_JOURNAL_TOPICS,
        }),
      });
    }

    const topic = await createCustomTopic(req.user.id, parsed.name);
    return res.status(201).json({ topic });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: journalMessage(locale, 'topicNameDuplicate') });
    }
    console.error('[journal-topics POST]', err);
    return res.status(500).json({ message: journalMessage(locale, 'topicCreateFailed') });
  }
};

export const patchCustomTopic = async (req, res) => {
  const locale = localeFromRequest(req);
  const topicId = typeof req.params.id === 'string' ? req.params.id.trim() : '';
  if (!topicId) {
    return res.status(400).json({ message: journalMessage(locale, 'customTopicNotFound') });
  }

  const parsed = parseTopicName(req.body?.name);
  if (!parsed.ok) {
    return res.status(400).json({ message: nameError(locale, parsed.messageKey) });
  }

  try {
    const topic = await renameCustomTopic(req.user.id, topicId, parsed.name);
    if (!topic) {
      return res.status(404).json({ message: journalMessage(locale, 'customTopicNotFound') });
    }
    return res.status(200).json({ topic });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: journalMessage(locale, 'topicNameDuplicate') });
    }
    console.error('[journal-topics PATCH]', err);
    return res.status(500).json({ message: journalMessage(locale, 'topicRenameFailed') });
  }
};
