import pool from '../db/db.js';

const mapRow = (row) => ({
  id: row.id,
  name: row.name,
  createdAt: row.created_at,
});

export const listCustomTopicsForUser = async (userId) => {
  const { rows } = await pool.query(
    `SELECT id, name, created_at
     FROM journal_custom_topics
     WHERE user_id = $1
     ORDER BY created_at ASC`,
    [userId],
  );
  return rows.map(mapRow);
};

export const countCustomTopicsForUser = async (userId) => {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS count
     FROM journal_custom_topics
     WHERE user_id = $1`,
    [userId],
  );
  return rows[0]?.count ?? 0;
};

export const createCustomTopic = async (userId, name) => {
  const { rows } = await pool.query(
    `INSERT INTO journal_custom_topics (user_id, name)
     VALUES ($1, $2)
     RETURNING id, name, created_at`,
    [userId, name],
  );
  return mapRow(rows[0]);
};

export const renameCustomTopic = async (userId, topicId, newName) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: existing } = await client.query(
      `SELECT id, name, created_at
       FROM journal_custom_topics
       WHERE id = $2 AND user_id = $1
       FOR UPDATE`,
      [userId, topicId],
    );
    const current = existing[0];
    if (!current) {
      await client.query('ROLLBACK');
      return null;
    }

    if (current.name === newName) {
      await client.query('COMMIT');
      return mapRow(current);
    }

    const { rows } = await client.query(
      `UPDATE journal_custom_topics
       SET name = $3
       WHERE id = $2 AND user_id = $1
       RETURNING id, name, created_at`,
      [userId, topicId, newName],
    );

    await client.query(
      `UPDATE journal_entries
       SET topics = array_replace(topics, $2, $3)
       WHERE user_id = $1 AND topics @> ARRAY[$2]::text[]`,
      [userId, current.name, newName],
    );

    await client.query('COMMIT');
    return mapRow(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};
