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

export async function listSessionUnblockIdsForUser(userId) {
  const { rows } = await pool.query(
    `SELECT session_id FROM user_unblocked_sessions WHERE user_id = $1 ORDER BY session_id`,
    [userId],
  );
  return rows.map((r) => r.session_id);
}

export async function recordSessionUnblock(userId, sessionId, db = pool) {
  await db.query(
    `INSERT INTO user_unblocked_sessions (user_id, session_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [userId, sessionId],
  );
}

/**
 * Returns the stored HMAC hash for a session's unlock code, or null if the
 * session has no code configured (in which case no code can ever match it).
 */
export async function findUnlockCodeHash(sessionId, db = pool) {
  const { rows } = await db.query(
    `SELECT code_hash FROM session_unlock_codes WHERE session_id = $1`,
    [sessionId],
  );
  return rows[0]?.code_hash ?? null;
}
