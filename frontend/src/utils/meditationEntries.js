import { countWords, WORDS_PER_PAGE } from './meditationPages.js';

export const MEDITATIONS_TOPIC = 'meditations';

const hasMeditationsTopic = (entry) =>
  Array.isArray(entry?.topics) && entry.topics.includes(MEDITATIONS_TOPIC);

const byCreatedAtAsc = (a, b) => new Date(a.createdAt) - new Date(b.createdAt);
const byCreatedAtDesc = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

export const filterMeditationEntriesNewestFirst = (entries) =>
  (Array.isArray(entries) ? entries : [])
    .filter(hasMeditationsTopic)
    .sort(byCreatedAtDesc);

export const meditationEntriesForPrint = (entries) =>
  (Array.isArray(entries) ? entries : [])
    .filter(hasMeditationsTopic)
    .sort(byCreatedAtAsc);

export const meditationPrintWordCount = (entries) =>
  meditationEntriesForPrint(entries).reduce(
    (sum, entry) => sum + countWords(entry?.content),
    0,
  );

export const meditationPrintPageEstimate = (entries) => {
  const words = meditationPrintWordCount(entries);
  if (words === 0) return 0;
  return Math.max(1, Math.ceil(words / WORDS_PER_PAGE));
};
