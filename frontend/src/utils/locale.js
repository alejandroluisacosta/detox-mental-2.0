export const DEFAULT_LOCALE = 'en';
export const SUPPORTED_LOCALES = ['en', 'es'];
export const LOCALE_STORAGE_KEY = 'appLocale';

export const BCP47_BY_LOCALE = {
  en: 'en-US',
  es: 'es-ES',
};

export const JOURNAL_TOPIC_IDS = [
  'Trabajo',
  'Interpersonal',
  'Reflexión',
  'Sabiduría',
  'Preocupaciones',
  'Meditaciones',
  'Privado',
];

let requestLocale = DEFAULT_LOCALE;

export const parseLocale = (value) => {
  if (typeof value !== 'string') return DEFAULT_LOCALE;
  const primary = value.trim().split(',')[0].split('-')[0].toLowerCase();
  return SUPPORTED_LOCALES.includes(primary) ? primary : DEFAULT_LOCALE;
};

export const getRequestLocale = () => requestLocale;

export const setRequestLocale = (locale) => {
  requestLocale = parseLocale(locale);
  return requestLocale;
};

export const readStoredLocale = () => {
  try {
    return parseLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY));
  } catch {
    return DEFAULT_LOCALE;
  }
};

export const writeStoredLocale = (locale) => {
  const next = parseLocale(locale);
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
  } catch {
    // Ignore quota / private-mode failures; in-memory locale still applies.
  }
  return next;
};

export const applyDocumentLocale = (locale) => {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = parseLocale(locale);
};

export const formatLocaleDate = (value, locale, options) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(BCP47_BY_LOCALE[parseLocale(locale)], options).format(
    date,
  );
};

export const interpolate = (template, values = {}) =>
  String(template).replace(/\{(\w+)\}/g, (_, key) =>
    values[key] == null ? `{${key}}` : String(values[key]),
  );
