import { getCatalog } from '../data/locales/catalogs.js';
import { DEFAULT_LOCALE, interpolate, parseLocale } from './locale.js';

export const translate = (locale, key, values) => {
  const resolvedLocale = parseLocale(locale);
  const catalog = getCatalog(resolvedLocale);
  const fallback = getCatalog(DEFAULT_LOCALE);
  const template = catalog[key] ?? fallback[key] ?? key;
  return interpolate(template, values);
};

export const translateTopic = (locale, topicId) => {
  const key = `journal.topics.${topicId}`;
  return getCatalog(locale)[key] ?? getCatalog(DEFAULT_LOCALE)[key] ?? topicId;
};
