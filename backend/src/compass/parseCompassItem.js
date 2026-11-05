export const COMPASS_KINDS = ['memory', 'goal'];

export const COMPASS_LIMITS = Object.freeze({
  goal: 3,
  memory: 15,
  chars: 200,
});

/** Dismissed suggestions are not offered again within this window. */
export const COMPASS_DISMISS_COOLDOWN_DAYS = 28;

export const isCompassKind = (value) => COMPASS_KINDS.includes(value);

export const normalizeCompassText = (value) => {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\s+/g, ' ');
};

/** Comparison key for "is this the same text?" (case- and space-insensitive). */
export const compassTextKey = (value) =>
  normalizeCompassText(value).toLowerCase();

/**
 * Validate a memory or goal text typed by the user (or edited from a suggestion).
 * @returns {{ ok: true, content: string } | { ok: false, messageKey: string }}
 */
export const parseCompassContent = (raw) => {
  const content = normalizeCompassText(raw);
  if (!content) {
    return { ok: false, messageKey: 'compassContentRequired' };
  }
  if (content.length > COMPASS_LIMITS.chars) {
    return { ok: false, messageKey: 'compassContentTooLong' };
  }
  return { ok: true, content };
};
