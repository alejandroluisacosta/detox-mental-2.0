import pool from '../db/db.js';

const MIN_SESSION = 1;
const MAX_SESSION = 15;

export function isValidSessionId(sessionId) {
  return (
    Number.isInteger(sessionId) &&
    sessionId >= MIN_SESSION &&
    sessionId <= MAX_SESSION
  );
}

export async function listUnblockedSessionIdsForUser(userId) {
  const { rows } = await pool.query(
    `SELECT session_id FROM user_unblocked_sessions WHERE user_id = $1 ORDER BY session_id`,
    [userId],
  );
  return rows.map((r) => r.session_id);
}

export async function recordUnblockedSession(userId, sessionId) {
  await pool.query(
    `INSERT INTO user_unblocked_sessions (user_id, session_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [userId, sessionId],
  );
}
