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
