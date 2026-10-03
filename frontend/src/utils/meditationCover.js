import { formatLocaleDate } from './locale.js';
import { meditationEntriesForPrint } from './meditationEntries.js';

export const meditationCoverTitle = (savedTitle, fallback) => {
  const trimmed = typeof savedTitle === 'string' ? savedTitle.trim() : '';
  return trimmed || fallback;
};

export const meditationCoverAuthor = (savedAuthor) => {
  const trimmed = typeof savedAuthor === 'string' ? savedAuthor.trim() : '';
  return trimmed || null;
};

const meditationCoverYear = (iso, locale) => {
  const formatted = formatLocaleDate(iso, locale, { year: 'numeric' });
  if (!formatted) return null;
  const year = Number(formatted);
  return Number.isFinite(year) ? year : null;
};

export const meditationCoverYearSpan = (entries, locale) => {
  const ordered = meditationEntriesForPrint(entries);
  const years = ordered
    .map((entry) => meditationCoverYear(entry?.createdAt, locale))
    .filter((year) => year != null);
  if (years.length === 0) return null;
  return { start: years[0], end: years[years.length - 1] };
};
