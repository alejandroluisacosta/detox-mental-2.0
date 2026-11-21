const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

const pad = (n) => String(n).padStart(2, '0');

const toIso = (year, month, day) => `${year}-${pad(month)}-${pad(day)}`;

// A calendar date exists only if Date.UTC does not roll it over (Feb 30 → Mar 2).
const dateExists = (year, month, day) => {
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
};

export const isValidIsoDate = (value) => {
  const match = ISO_DATE.exec(value);
  if (!match) return false;
  return dateExists(Number(match[1]), Number(match[2]), Number(match[3]));
};

/**
 * Exact anniversaries of a UTC date, in priority order: one year ago, then one
 * month ago (same day number). A date that does not exist in the earlier month
 * or year (the 31st after a short month, February 29) has no anniversary.
 */
export const anniversaryLookups = (todayIso) => {
  const [, y, m, d] = ISO_DATE.exec(todayIso).map(Number);
  const lookups = [];

  if (dateExists(y - 1, m, d)) {
    lookups.push({ horizon: '1y', date: toIso(y - 1, m, d) });
  }

  const monthYear = m === 1 ? y - 1 : y;
  const month = m === 1 ? 12 : m - 1;
  if (dateExists(monthYear, month, d)) {
    lookups.push({ horizon: '1m', date: toIso(monthYear, month, d) });
  }

  return lookups;
};
