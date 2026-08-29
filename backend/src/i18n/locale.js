export const DEFAULT_LOCALE = 'en';
export const SUPPORTED_LOCALES = ['en', 'es'];

export const parseLocale = (value) => {
  if (typeof value !== 'string') return DEFAULT_LOCALE;
  const primary = value.trim().split(',')[0].split('-')[0].toLowerCase();
  return SUPPORTED_LOCALES.includes(primary) ? primary : DEFAULT_LOCALE;
};

export const localeFromRequest = (req) =>
  parseLocale(req.get?.('accept-language') || req.headers?.['accept-language']);

export const interpolate = (template, values = {}) =>
  String(template).replace(/\{(\w+)\}/g, (_, key) =>
    values[key] == null ? `{${key}}` : String(values[key]),
  );
