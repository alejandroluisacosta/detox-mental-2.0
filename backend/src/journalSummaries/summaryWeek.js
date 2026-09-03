/**
 * Quota week and rolling entry range for journal summaries.
 * Product timezone: Europe/Madrid.
 * Quota week: Monday 00:00 → next Monday 00:00 (2 generations; resets Monday 00:00).
 * Entry window: the last 7 calendar days, ending today.
 */

export const SUMMARY_TIMEZONE = 'Europe/Madrid';
export const MIN_ENTRIES_FOR_SUMMARY = 2;
export const SUMMARY_GENERATIONS_PER_WEEK = 2;
export const SUMMARY_LOOKBACK_DAYS = 7;

const pad2 = (n) => String(n).padStart(2, '0');

const toDateString = (year, month, day) =>
  `${year}-${pad2(month)}-${pad2(day)}`;

/** Local calendar/clock parts for `date` in `timeZone`. */
export const getZonedParts = (date, timeZone = SUMMARY_TIMEZONE) => {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'short',
    hourCycle: 'h23',
  });
  const parts = Object.fromEntries(
    dtf
      .formatToParts(date)
      .filter((p) => p.type !== 'literal')
      .map((p) => [p.type, p.value]),
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
    weekday: parts.weekday,
  };
};

/** Offset (ms) such that: utcMs + offset ≈ zoned wall-clock as UTC fields. */
const getTimeZoneOffsetMs = (date, timeZone) => {
  const parts = getZonedParts(date, timeZone);
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  return asUtc - date.getTime();
};

/** Convert a wall-clock time in `timeZone` to a UTC Date. */
export const zonedLocalToUtc = (
  year,
  month,
  day,
  hour = 0,
  minute = 0,
  second = 0,
  timeZone = SUMMARY_TIMEZONE,
) => {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second);
  const offset1 = getTimeZoneOffsetMs(new Date(utcGuess), timeZone);
  const utc1 = Date.UTC(year, month - 1, day, hour, minute, second) - offset1;
  const offset2 = getTimeZoneOffsetMs(new Date(utc1), timeZone);
  return new Date(
    Date.UTC(year, month - 1, day, hour, minute, second) - offset2,
  );
};

const WEEKDAY_TO_OFFSET = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

const addDaysToYmd = (year, month, day, deltaDays) => {
  const utc = new Date(Date.UTC(year, month - 1, day));
  utc.setUTCDate(utc.getUTCDate() + deltaDays);
  return {
    year: utc.getUTCFullYear(),
    month: utc.getUTCMonth() + 1,
    day: utc.getUTCDate(),
  };
};

/**
 * ISO-style week containing `now` in the product timezone:
 * Monday 00:00 inclusive → next Monday 00:00 exclusive.
 */
export const getWeekBounds = (now = new Date(), timeZone = SUMMARY_TIMEZONE) => {
  const parts = getZonedParts(now, timeZone);
  const daysFromMonday = WEEKDAY_TO_OFFSET[parts.weekday];
  if (daysFromMonday === undefined) {
    throw new Error(`Unexpected weekday: ${parts.weekday}`);
  }

  const monday = addDaysToYmd(parts.year, parts.month, parts.day, -daysFromMonday);
  const nextMonday = addDaysToYmd(monday.year, monday.month, monday.day, 7);
  const sunday = addDaysToYmd(monday.year, monday.month, monday.day, 6);

  const periodStart = zonedLocalToUtc(
    monday.year,
    monday.month,
    monday.day,
    0,
    0,
    0,
    timeZone,
  );
  const periodEnd = zonedLocalToUtc(
    nextMonday.year,
    nextMonday.month,
    nextMonday.day,
    0,
    0,
    0,
    timeZone,
  );

  return {
    weekStart: toDateString(monday.year, monday.month, monday.day),
    weekEnd: toDateString(sunday.year, sunday.month, sunday.day),
    periodStart,
    periodEnd,
    timezone: timeZone,
  };
};

/** Calendar date of `date` in `timeZone` as YYYY-MM-DD. */
export const zonedDateString = (date, timeZone = SUMMARY_TIMEZONE) => {
  const parts = getZonedParts(date, timeZone);
  return toDateString(parts.year, parts.month, parts.day);
};

/**
 * Inclusive last `SUMMARY_LOOKBACK_DAYS` calendar days in the product timezone.
 * periodStart is 00:00 of the first day; periodEnd is `now` (exclusive).
 */
export const getRollingEntryRange = (
  now = new Date(),
  timeZone = SUMMARY_TIMEZONE,
) => {
  const parts = getZonedParts(now, timeZone);
  const start = addDaysToYmd(
    parts.year,
    parts.month,
    parts.day,
    -(SUMMARY_LOOKBACK_DAYS - 1),
  );
  const periodStart = zonedLocalToUtc(
    start.year,
    start.month,
    start.day,
    0,
    0,
    0,
    timeZone,
  );

  return {
    rangeStart: toDateString(start.year, start.month, start.day),
    rangeEnd: toDateString(parts.year, parts.month, parts.day),
    periodStart,
    periodEnd: now,
    timezone: timeZone,
  };
};

export const buildQuotaPayload = (
  used,
  now = new Date(),
  timeZone = SUMMARY_TIMEZONE,
) => {
  const limit = SUMMARY_GENERATIONS_PER_WEEK;
  const usedCount = Number.isFinite(used) ? used : 0;
  return {
    timezone: timeZone,
    limit,
    used: usedCount,
    remaining: Math.max(limit - usedCount, 0),
    resetsAt: getWeekBounds(now, timeZone).periodEnd.toISOString(),
  };
};
