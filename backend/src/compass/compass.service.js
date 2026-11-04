import pool from '../db/db.js';
import { COMPASS_DISMISS_COOLDOWN_DAYS } from './parseCompassItem.js';

const DAY_MS = 24 * 60 * 60 * 1000;
export const MAX_DISMISSED_IN_PROMPT = 20;

const toIso = (value) => (value instanceof Date ? value.toISOString() : value);

const ITEM_COLUMNS = 'id, kind, content, created_at, updated_at';

const mapItem = (row) => ({
  id: row.id,
  kind: row.kind,
  content: row.content,
  createdAt: toIso(row.created_at),
  updatedAt: toIso(row.updated_at),
});

const SUGGESTION_COLUMNS =
  'id, summary_id, action, kind, target_item_id, target_content, content, status, created_at';

const mapSuggestion = (row) => ({
  id: row.id,
  action: row.action,
  kind: row.kind,
  targetItemId: row.target_item_id ?? null,
  targetContent: row.target_content ?? null,
  content: row.content ?? null,
  createdAt: toIso(row.created_at),
});

/**
 * Run `fn` inside a transaction on one client. A db without `connect`
 * (a single client) runs the statements on itself.
 */
const withTransaction = async (db, fn) => {
  const client = typeof db.connect === 'function' ? await db.connect() : db;
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query(result?.rollback ? 'ROLLBACK' : 'COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    if (client !== db) client.release?.();
  }
};

export const listCompassItems = async (userId, db = pool) => {
  const { rows } = await db.query(
    `SELECT ${ITEM_COLUMNS}
     FROM compass_items
     WHERE user_id = $1
     ORDER BY created_at ASC, id ASC`,
    [userId],
  );
  return rows.map(mapItem);
};

export const countCompassItems = async (userId, db = pool) => {
  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS count FROM compass_items WHERE user_id = $1`,
    [userId],
  );
  return rows[0]?.count ?? 0;
};

/** Insert unless the user already has `limit` items of that kind. Returns null at the cap. */
export const createCompassItem = async (
  { userId, kind, content, limit },
  db = pool,
) => {
  const { rows } = await db.query(
    `INSERT INTO compass_items (user_id, kind, content)
     SELECT $1, $2, $3
     WHERE (SELECT COUNT(*) FROM compass_items WHERE user_id = $1 AND kind = $2) < $4
     RETURNING ${ITEM_COLUMNS}`,
    [userId, kind, content, limit],
  );
  return rows[0] ? mapItem(rows[0]) : null;
};

export const updateCompassItem = async ({ userId, itemId, content }, db = pool) => {
  const { rows } = await db.query(
    `UPDATE compass_items
     SET content = $3, updated_at = NOW()
     WHERE id = $2 AND user_id = $1
     RETURNING ${ITEM_COLUMNS}`,
    [userId, itemId, content],
  );
  return rows[0] ? mapItem(rows[0]) : null;
};

export const deleteCompassItem = async ({ userId, itemId }, db = pool) => {
  const { rows } = await db.query(
    `DELETE FROM compass_items
     WHERE id = $2 AND user_id = $1
     RETURNING id`,
    [userId, itemId],
  );
  return rows[0]?.id ?? null;
};

export const listPendingSuggestionsForSummary = async (
  userId,
  summaryId,
  db = pool,
) => {
  const { rows } = await db.query(
    `SELECT ${SUGGESTION_COLUMNS}
     FROM compass_suggestions
     WHERE user_id = $1 AND summary_id = $2 AND status = 'pending'
     ORDER BY created_at ASC, id ASC`,
    [userId, summaryId],
  );
  return rows.map(mapSuggestion);
};

/** Pending suggestions of the summary for `weekStart` only; older weeks are ignored. */
export const countPendingSuggestionsForWeek = async (
  userId,
  weekStart,
  db = pool,
) => {
  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS count
     FROM compass_suggestions s
     JOIN journal_weekly_summaries w ON w.id = s.summary_id
     WHERE s.user_id = $1 AND s.status = 'pending' AND w.week_start = $2`,
    [userId, weekStart],
  );
  return rows[0]?.count ?? 0;
};

export const dismissedSince = (now = new Date()) =>
  new Date(now.getTime() - COMPASS_DISMISS_COOLDOWN_DAYS * DAY_MS);

/** Texts the user dismissed within the cooldown, newest first. */
export const listRecentlyDismissedSuggestions = async (
  userId,
  now = new Date(),
  db = pool,
) => {
  const { rows } = await db.query(
    `SELECT action, kind, content, target_content, dismissed_at
     FROM compass_suggestions
     WHERE user_id = $1 AND status = 'dismissed' AND dismissed_at >= $2
     ORDER BY dismissed_at DESC
     LIMIT $3`,
    [userId, dismissedSince(now), MAX_DISMISSED_IN_PROMPT],
  );
  return rows.map((row) => ({
    action: row.action,
    kind: row.kind,
    text: row.action === 'remove' ? row.target_content : row.content,
  }));
};

/**
 * Replace the summary's unreviewed suggestions with a new set.
 * Dismissed rows stay (they drive the cooldown); ones past it are pruned.
 */
export const replacePendingSuggestions = async (
  { userId, summaryId, suggestions, now = new Date() },
  db = pool,
) =>
  withTransaction(db, async (client) => {
    await client.query(
      `DELETE FROM compass_suggestions
       WHERE user_id = $1 AND summary_id = $2 AND status = 'pending'`,
      [userId, summaryId],
    );
    await client.query(
      `DELETE FROM compass_suggestions
       WHERE user_id = $1 AND status = 'dismissed' AND dismissed_at < $2`,
      [userId, dismissedSince(now)],
    );

    const saved = [];
    for (const suggestion of suggestions) {
      const { rows } = await client.query(
        `INSERT INTO compass_suggestions
           (user_id, summary_id, action, kind, target_item_id, target_content, content)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING ${SUGGESTION_COLUMNS}`,
        [
          userId,
          summaryId,
          suggestion.action,
          suggestion.kind,
          suggestion.targetItemId ?? null,
          suggestion.targetContent ?? null,
          suggestion.action === 'remove' ? null : suggestion.content,
        ],
      );
      saved.push(mapSuggestion(rows[0]));
    }
    return saved;
  });

export const dismissSuggestion = async ({ userId, suggestionId }, db = pool) => {
  const { rows } = await db.query(
    `UPDATE compass_suggestions
     SET status = 'dismissed', dismissed_at = NOW()
     WHERE id = $2 AND user_id = $1 AND status = 'pending'
     RETURNING id`,
    [userId, suggestionId],
  );
  return rows[0]?.id ?? null;
};

/**
 * Apply a pending suggestion and delete it, in one transaction.
 * `content` (already validated) replaces the suggested text for add/update.
 * @returns {{ item } | { removedItemId } | { error: 'not_found' | 'stale' | 'full' | 'content_not_allowed' }}
 */
export const acceptSuggestion = async (
  { userId, suggestionId, content, limits },
  db = pool,
) =>
  withTransaction(db, async (client) => {
    const { rows: found } = await client.query(
      `SELECT ${SUGGESTION_COLUMNS}
       FROM compass_suggestions
       WHERE id = $2 AND user_id = $1 AND status = 'pending'
       FOR UPDATE`,
      [userId, suggestionId],
    );
    const suggestion = found[0];
    if (!suggestion) return { error: 'not_found', rollback: true };

    if (suggestion.action === 'remove' && content !== undefined) {
      return { error: 'content_not_allowed', rollback: true };
    }

    const removeSuggestion = () =>
      client.query(`DELETE FROM compass_suggestions WHERE id = $2 AND user_id = $1`, [
        userId,
        suggestionId,
      ]);

    if (suggestion.action === 'add') {
      const { rows } = await client.query(
        `INSERT INTO compass_items (user_id, kind, content)
         SELECT $1, $2, $3
         WHERE (SELECT COUNT(*) FROM compass_items WHERE user_id = $1 AND kind = $2) < $4
         RETURNING ${ITEM_COLUMNS}`,
        [userId, suggestion.kind, content ?? suggestion.content, limits[suggestion.kind]],
      );
      if (!rows[0]) return { error: 'full', kind: suggestion.kind, rollback: true };
      await removeSuggestion();
      return { item: mapItem(rows[0]) };
    }

    const { rows: targets } = await client.query(
      `SELECT ${ITEM_COLUMNS}
       FROM compass_items
       WHERE id = $2 AND user_id = $1
       FOR UPDATE`,
      [userId, suggestion.target_item_id],
    );
    const target = targets[0];
    if (!target || target.content !== suggestion.target_content) {
      // The item changed after the suggestion was made: drop it, never apply it.
      await removeSuggestion();
      return { error: 'stale' };
    }

    if (suggestion.action === 'remove') {
      await removeSuggestion();
      await client.query(`DELETE FROM compass_items WHERE id = $2 AND user_id = $1`, [
        userId,
        target.id,
      ]);
      return { removedItemId: target.id };
    }

    const { rows } = await client.query(
      `UPDATE compass_items
       SET content = $3, updated_at = NOW()
       WHERE id = $2 AND user_id = $1
       RETURNING ${ITEM_COLUMNS}`,
      [userId, target.id, content ?? suggestion.content],
    );
    await removeSuggestion();
    return { item: mapItem(rows[0]) };
  });
