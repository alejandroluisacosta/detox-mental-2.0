import pool from '../db/db.js';

const toDateOnly = (value) => {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'string') return value.slice(0, 10);
  return value;
};

const toIso = (value) => {
  if (value instanceof Date) return value.toISOString();
  return value;
};

const mapSummaryRow = (row) => ({
  id: row.id,
  weekStart: toDateOnly(row.week_start),
  weekEnd: toDateOnly(row.week_end),
  periodStart: toIso(row.period_start),
  periodEnd: toIso(row.period_end),
  summaryText: row.summary_text,
  mainTopics: row.main_topics ?? [],
  bestQuote: row.best_quote,
  bestQuoteEntryId: row.best_quote_entry_id,
  socraticText: row.socratic_text,
  machiavelliText: row.machiavelli_text,
  entryCount: row.entry_count,
  modelId: row.model_id,
  locale: row.locale,
  createdAt: toIso(row.created_at),
});

export const listJournalEntriesInRange = async (userId, periodStart, periodEnd) => {
  const { rows } = await pool.query(
    `SELECT id, content, topics, created_at
     FROM journal_entries
     WHERE user_id = $1
       AND created_at >= $2
       AND created_at < $3
     ORDER BY created_at ASC`,
    [userId, periodStart, periodEnd],
  );
  return rows.map((row) => ({
    id: row.id,
    content: row.content,
    topics: row.topics ?? [],
    createdAt: row.created_at,
  }));
};

export const countJournalEntriesInRange = async (
  userId,
  periodStart,
  periodEnd,
) => {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS count
     FROM journal_entries
     WHERE user_id = $1
       AND created_at >= $2
       AND created_at < $3`,
    [userId, periodStart, periodEnd],
  );
  return rows[0]?.count ?? 0;
};

export const getWeeklySummaryForUser = async (userId, weekStart) => {
  const { rows } = await pool.query(
    `SELECT id, user_id, week_start, week_end, period_start, period_end,
            summary_text, main_topics, best_quote, best_quote_entry_id,
            socratic_text, machiavelli_text, entry_count, model_id, locale, created_at
     FROM journal_weekly_summaries
     WHERE user_id = $1 AND week_start = $2`,
    [userId, weekStart],
  );
  return rows[0] ? mapSummaryRow(rows[0]) : null;
};

export const createWeeklySummary = async ({
  userId,
  weekStart,
  weekEnd,
  periodStart,
  periodEnd,
  summaryText,
  mainTopics,
  bestQuote,
  bestQuoteEntryId,
  socraticText,
  machiavelliText,
  entryCount,
  modelId,
  locale,
}) => {
  const { rows } = await pool.query(
    `INSERT INTO journal_weekly_summaries (
       user_id, week_start, week_end, period_start, period_end,
       summary_text, main_topics, best_quote, best_quote_entry_id,
       socratic_text, machiavelli_text, entry_count, model_id, locale
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     RETURNING id, user_id, week_start, week_end, period_start, period_end,
               summary_text, main_topics, best_quote, best_quote_entry_id,
               socratic_text, machiavelli_text, entry_count, model_id, locale, created_at`,
    [
      userId,
      weekStart,
      weekEnd,
      periodStart,
      periodEnd,
      summaryText,
      mainTopics,
      bestQuote,
      bestQuoteEntryId,
      socraticText,
      machiavelliText,
      entryCount,
      modelId,
      locale,
    ],
  );
  return mapSummaryRow(rows[0]);
};

/** Insert or replace the week's summary. Always refreshes created_at. */
export const upsertWeeklySummary = async ({
  userId,
  weekStart,
  weekEnd,
  periodStart,
  periodEnd,
  summaryText,
  mainTopics,
  bestQuote,
  bestQuoteEntryId,
  socraticText,
  machiavelliText,
  entryCount,
  modelId,
  locale,
}) => {
  const { rows } = await pool.query(
    `INSERT INTO journal_weekly_summaries (
       user_id, week_start, week_end, period_start, period_end,
       summary_text, main_topics, best_quote, best_quote_entry_id,
       socratic_text, machiavelli_text, entry_count, model_id, locale
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     ON CONFLICT (user_id, week_start) DO UPDATE SET
       week_end = EXCLUDED.week_end,
       period_start = EXCLUDED.period_start,
       period_end = EXCLUDED.period_end,
       summary_text = EXCLUDED.summary_text,
       main_topics = EXCLUDED.main_topics,
       best_quote = EXCLUDED.best_quote,
       best_quote_entry_id = EXCLUDED.best_quote_entry_id,
       socratic_text = EXCLUDED.socratic_text,
       machiavelli_text = EXCLUDED.machiavelli_text,
       entry_count = EXCLUDED.entry_count,
       model_id = EXCLUDED.model_id,
       locale = EXCLUDED.locale,
       created_at = NOW()
     RETURNING id, user_id, week_start, week_end, period_start, period_end,
               summary_text, main_topics, best_quote, best_quote_entry_id,
               socratic_text, machiavelli_text, entry_count, model_id, locale, created_at`,
    [
      userId,
      weekStart,
      weekEnd,
      periodStart,
      periodEnd,
      summaryText,
      mainTopics,
      bestQuote,
      bestQuoteEntryId,
      socraticText,
      machiavelliText,
      entryCount,
      modelId,
      locale,
    ],
  );
  return mapSummaryRow(rows[0]);
};
