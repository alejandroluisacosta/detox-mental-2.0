import { DEFAULT_LOCALE, parseLocale } from '../../utils/locale.js';

export const CONTENT_SOURCE_LOCALE = 'es';

export const isSourceLocale = (locale) => parseLocale(locale) === CONTENT_SOURCE_LOCALE;

/**
 * Pick a locale overlay, then fall back field-by-field to Spanish.
 * Missing English files or keys must keep serving Spanish so the app
 * stays usable at every intermediate translation commit.
 */
export const pickLocalized = (source, overlay, key) => {
  const value = overlay?.[key];
  if (value == null) return source[key];
  if (typeof value === 'string' && value.trim() === '') return source[key];
  if (Array.isArray(value) && value.length === 0) return source[key];
  return value;
};

export const resolveOverlay = (locale, overlays) => {
  const resolved = parseLocale(locale);
  if (resolved === CONTENT_SOURCE_LOCALE) return overlays[CONTENT_SOURCE_LOCALE];
  return overlays[resolved] ?? overlays[DEFAULT_LOCALE] ?? overlays[CONTENT_SOURCE_LOCALE];
};
