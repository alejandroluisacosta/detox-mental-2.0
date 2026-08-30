import {
  MAX_TOPIC_NAME_LENGTH,
  RESERVED_TOPIC_NAMES,
} from '../data/journalTopics.js';

export const normalizeTopicName = (value) => {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\s+/g, ' ');
};

export const validateTopicName = ({ name, existingNames = [] }) => {
  const normalized = normalizeTopicName(name);
  if (!normalized) {
    return { valid: false, messageKey: 'journal.topicNameRequired' };
  }
  if (normalized.length > MAX_TOPIC_NAME_LENGTH) {
    return { valid: false, messageKey: 'journal.topicNameTooLong' };
  }
  if (RESERVED_TOPIC_NAMES.includes(normalized.toLowerCase())) {
    return { valid: false, messageKey: 'journal.topicNameReserved' };
  }
  const taken = existingNames.some(
    (item) => typeof item === 'string' && item.toLowerCase() === normalized.toLowerCase(),
  );
  if (taken) {
    return { valid: false, messageKey: 'journal.topicNameDuplicate' };
  }
  return { valid: true, name: normalized };
};
