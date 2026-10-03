export const DEFAULT_LOCALE = 'en';
export const SOURCE_LOCALE = 'es';
export const SUPPORTED_LOCALES = ['en', 'es'];

export const parseLocale = (value) => {
  if (typeof value !== 'string') return DEFAULT_LOCALE;
  const primary = value.trim().split(',')[0].split('-')[0].toLowerCase();
  return SUPPORTED_LOCALES.includes(primary) ? primary : DEFAULT_LOCALE;
};

export const localeFromRequest = (req) => {
  const fromBody = req?.body?.locale;
  if (typeof fromBody === 'string' && fromBody.trim()) {
    return parseLocale(fromBody);
  }
  return parseLocale(req.get?.('accept-language') || req.headers?.['accept-language']);
};

/**
 * Pick a { es, en } value. Missing translations fall back to Spanish (source),
 * then English (product default). Plain strings pass through unchanged.
 */
export const pickLocalized = (byLocale, locale) => {
  if (byLocale == null || typeof byLocale !== 'object') return byLocale;
  const resolved = parseLocale(locale);
  if (byLocale[resolved] != null) return byLocale[resolved];
  if (byLocale[SOURCE_LOCALE] != null) return byLocale[SOURCE_LOCALE];
  if (byLocale[DEFAULT_LOCALE] != null) return byLocale[DEFAULT_LOCALE];
  return byLocale;
};

export const interpolate = (template, values = {}) =>
  String(template).replace(/\{(\w+)\}/g, (_, key) =>
    values[key] == null ? `{${key}}` : String(values[key]),
  );
