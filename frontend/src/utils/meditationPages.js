import { BCP47_BY_LOCALE, parseLocale } from './locale.js';

export const WORDS_PER_PAGE = 250;
export const TOTAL_PAGES = 24;
export const GOAL_WORDS = TOTAL_PAGES * WORDS_PER_PAGE;

export const countWords = (text) => {
  if (typeof text !== 'string') return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
};

const roundHalfUp = (value, fractionDigits) => {
  const factor = 10 ** fractionDigits;
  return Math.round(value * factor) / factor;
};

export const pagesRemaining = (entries) => {
  const list = Array.isArray(entries) ? entries : [];
  const totalWords = list.reduce((sum, entry) => sum + countWords(entry?.content), 0);

  if (totalWords >= GOAL_WORDS) return 0;

  const pagesLeft = TOTAL_PAGES - totalWords / WORDS_PER_PAGE;
  const rounded = roundHalfUp(pagesLeft, 1);
  if (rounded === 0) return 0.1;
  return rounded;
};

export const formatPagesRemaining = (pages, locale) =>
  new Intl.NumberFormat(BCP47_BY_LOCALE[parseLocale(locale)], {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(pages);

export const MEDITATION_GOAL_STORAGE_KEY = 'journalMeditations:progressGoal';

export const MEDITATION_GOALS = {
  BOOK: 'book',
  ENTRIES_25: 'entries25',
  ENTRIES_50: 'entries50',
};

const VALID_MEDITATION_GOALS = new Set(Object.values(MEDITATION_GOALS));

export const ENTRY_GOAL_TARGETS = {
  [MEDITATION_GOALS.ENTRIES_25]: 25,
  [MEDITATION_GOALS.ENTRIES_50]: 50,
};

export const entriesRemaining = (entries, target) => {
  const count = Array.isArray(entries) ? entries.length : 0;
  const goal = Number(target);
  if (!Number.isFinite(goal) || goal <= 0) return 0;
  return Math.max(0, goal - count);
};

export const readMeditationProgressGoal = () => {
  try {
    const stored = window.localStorage.getItem(MEDITATION_GOAL_STORAGE_KEY);
    if (stored && VALID_MEDITATION_GOALS.has(stored)) return stored;
  } catch {
    // ignore storage errors
  }
  return MEDITATION_GOALS.BOOK;
};

export const writeMeditationProgressGoal = (goal) => {
  if (!VALID_MEDITATION_GOALS.has(goal)) return;
  try {
    window.localStorage.setItem(MEDITATION_GOAL_STORAGE_KEY, goal);
  } catch {
    // ignore storage errors
  }
};
