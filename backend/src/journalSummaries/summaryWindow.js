/**
 * Week bounds and Sunday creation window for journal summaries.
 * Product timezone: Europe/Madrid. Week = Monday 00:00 → next Monday 00:00.
 * Creation window: Sunday 12:00–18:00 (inclusive start, exclusive end).
 */

export const SUMMARY_TIMEZONE = 'Europe/Madrid';
export const MIN_ENTRIES_FOR_SUMMARY = 2;

/** When true, creation window is Sunday 12:00–18:00 Europe/Madrid. */
export const ENFORCE_SUMMARY_WINDOW = true;

const WINDOW_START_HOUR = 12;
const WINDOW_END_HOUR = 18;

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

  const opensAt = zonedLocalToUtc(
    sunday.year,
    sunday.month,
    sunday.day,
    WINDOW_START_HOUR,
    0,
    0,
    timeZone,
  );
  const closesAt = zonedLocalToUtc(
    sunday.year,
    sunday.month,
    sunday.day,
    WINDOW_END_HOUR,
    0,
    0,
    timeZone,
  );

  return {
    weekStart: toDateString(monday.year, monday.month, monday.day),
    weekEnd: toDateString(sunday.year, sunday.month, sunday.day),
    periodStart,
    periodEnd,
    opensAt,
    closesAt,
    timezone: timeZone,
  };
};

/** Whether creation is allowed for `now` (respects ENFORCE_SUMMARY_WINDOW). */
export const isSummaryWindowOpen = (
  now = new Date(),
  timeZone = SUMMARY_TIMEZONE,
) => {
  if (!ENFORCE_SUMMARY_WINDOW) return true;

  const bounds = getWeekBounds(now, timeZone);
  const t = now.getTime();
  return t >= bounds.opensAt.getTime() && t < bounds.closesAt.getTime();
};

export const buildWindowPayload = (
  now = new Date(),
  timeZone = SUMMARY_TIMEZONE,
) => {
  const bounds = getWeekBounds(now, timeZone);
  return {
    timezone: timeZone,
    open: isSummaryWindowOpen(now, timeZone),
    enforced: ENFORCE_SUMMARY_WINDOW,
    opensAt: bounds.opensAt.toISOString(),
    closesAt: bounds.closesAt.toISOString(),
  };
};
