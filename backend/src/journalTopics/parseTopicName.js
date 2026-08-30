export const MAX_TOPIC_NAME_LENGTH = 24;
export const MAX_CUSTOM_JOURNAL_TOPICS = 10;

export const RESERVED_TOPIC_NAMES = [
  'work',
  'trabajo',
  'interpersonal',
  'reflection',
  'reflexión',
  'wisdom',
  'sabiduría',
  'worries',
  'preocupaciones',
  'meditations',
  'meditaciones',
  'private',
  'privado',
];

export const normalizeTopicName = (value) => {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\s+/g, ' ');
};

export const parseTopicName = (raw) => {
  const name = normalizeTopicName(raw);
  if (!name) {
    return { ok: false, messageKey: 'topicNameRequired' };
  }
  if (name.length > MAX_TOPIC_NAME_LENGTH) {
    return { ok: false, messageKey: 'topicNameTooLong' };
  }
  if (RESERVED_TOPIC_NAMES.includes(name.toLowerCase())) {
    return { ok: false, messageKey: 'topicNameReserved' };
  }
  return { ok: true, name };
};
