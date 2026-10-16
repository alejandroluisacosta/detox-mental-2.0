import pool from '../db/db.js';

const PURGE_PROBABILITY = 0.05;
const PURGE_AGE_MS = 24 * 60 * 60 * 1000;

/**
 * Records one event for (bucket, subject) unless any window in `limits` is
 * already full. Returns true when allowed (and recorded), false when denied
 * (nothing is recorded, so a denial never extends the block).
 *
 * Counting then inserting is not atomic: concurrent requests can overshoot by
 * the number in flight at once. That is acceptable at these limits.
 */
export async function consumeRateLimit({
  bucket,
  subject,
  limits,
  now = new Date(),
  db = pool,
  random = Math.random,
}) {
  const windowStarts = limits.map(({ windowMs }) => new Date(now.getTime() - windowMs));
  const oldest = new Date(Math.min(...windowStarts.map((d) => d.getTime())));

  const counters = windowStarts
    .map((_, i) => `COUNT(*) FILTER (WHERE created_at >= $${i + 4})::int AS c${i}`)
    .join(', ');

  const { rows } = await db.query(
    `SELECT ${counters}
     FROM rate_limit_events
     WHERE bucket = $1 AND subject = $2 AND created_at >= $3`,
    [bucket, subject, oldest, ...windowStarts],
  );

  const counts = rows[0] ?? {};
  const full = limits.some(({ max }, i) => (counts[`c${i}`] ?? 0) >= max);
  if (full) return false;

  await db.query(
    `INSERT INTO rate_limit_events (bucket, subject, created_at)
     VALUES ($1, $2, $3)`,
    [bucket, subject, now],
  );

  if (random() < PURGE_PROBABILITY) {
    await db.query(`DELETE FROM rate_limit_events WHERE created_at < $1`, [
      new Date(now.getTime() - PURGE_AGE_MS),
    ]);
  }

  return true;
}
