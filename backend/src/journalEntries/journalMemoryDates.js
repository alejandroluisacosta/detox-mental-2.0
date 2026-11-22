const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

const pad = (value, size = 2) => String(value).padStart(size, '0');

const formatDate = ({ year, month, day }) => `${pad(year, 4)}-${pad(month)}-${pad(day)}`;

/** Returns the date only when it exists on the calendar (no Feb 30, no Apr 31). */
const realDate = (year, month, day) => {
  const probe = new Date(Date.UTC(year, month - 1, day));
  probe.setUTCFullYear(year);
  const exists =
    probe.getUTCFullYear() === year &&
    probe.getUTCMonth() === month - 1 &&
    probe.getUTCDate() === day;
  return exists ? { year, month, day } : null;
};

/** Parses a strict `YYYY-MM-DD` string that names a real calendar date. */
export const parseIsoDate = (value) => {
  if (typeof value !== 'string') return null;
  const match = ISO_DATE_RE.exec(value);
  if (!match) return null;
  const date = realDate(Number(match[1]), Number(match[2]), Number(match[3]));
  return date ? formatDate(date) : null;
};

export const utcDateOf = (instant) =>
  formatDate({
    year: instant.getUTCFullYear(),
    month: instant.getUTCMonth() + 1,
    day: instant.getUTCDate(),
  });

/**
 * Anniversary dates to look up for `today`, in priority order. A horizon is
 * skipped when its date does not exist (Feb 29 a year later, the 31st after a
 * shorter month).
 */
export const memoryLookupDates = (today) => {
  const [year, month, day] = today.split('-').map(Number);
  const previousMonth = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
  const candidates = [
    { horizon: '1y', date: realDate(year - 1, month, day) },
    { horizon: '1m', date: realDate(previousMonth.year, previousMonth.month, day) },
  ];
  return candidates
    .filter((candidate) => candidate.date)
    .map((candidate) => ({ horizon: candidate.horizon, date: formatDate(candidate.date) }));
};

/** Half-open UTC window `[start, end)` covering one calendar date. */
export const utcDayWindow = (date) => {
  const start = new Date(`${date}T00:00:00.000Z`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
};
