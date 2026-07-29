import pool from '../db/db.js';

const mapRow = (row) => ({
  id: row.id,
  content: row.content,
  topics: row.topics ?? [],
  createdAt: row.created_at,
});

export const createJournalEntry = async (userId, content, topics = []) => {
  const { rows } = await pool.query(
    `INSERT INTO journal_entries (user_id, content, topics)
     VALUES ($1, $2, $3)
     RETURNING id, content, topics, created_at`,
    [userId, content, topics],
  );
  return mapRow(rows[0]);
};

export const listJournalEntriesForUser = async (userId) => {
  const { rows } = await pool.query(
    `SELECT id, content, topics, created_at
     FROM journal_entries
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId],
  );
  return rows.map(mapRow);
};
