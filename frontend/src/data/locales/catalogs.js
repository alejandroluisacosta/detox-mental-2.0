import { DEFAULT_LOCALE, parseLocale } from '../../utils/locale.js';
import { en } from './en.js';
import { es } from './es.js';

export const catalogs = {
  en,
  es,
};

export const getCatalog = (locale) => catalogs[parseLocale(locale)] || catalogs[DEFAULT_LOCALE];
