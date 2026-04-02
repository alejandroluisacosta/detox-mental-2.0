import pool from '../db/db.js';

export async function storeLoginToken(tokenHash, expiresAt) {
  await pool.query(
    `INSERT INTO magic_link_tokens (token_hash, expires_at)
     VALUES ($1, $2)`,
    [tokenHash, expiresAt],
  );
}

export async function findValidToken(tokenHash) {
  const { rows } = await pool.query(
    `SELECT * FROM magic_link_tokens
     WHERE token_hash = $1
       AND expires_at > NOW()
       AND used_at IS NULL`,
    [tokenHash],
  );
  return rows[0] ?? null;
}

export async function markTokenUsedAndAssignUser(tokenHash, userId) {
  await pool.query(
    `UPDATE magic_link_tokens
     SET used_at = NOW(), user_id = $2
     WHERE token_hash = $1`,
    [tokenHash, userId],
  );
}

export async function findUserByEmail(email) {
  const { rows } = await pool.query(
    `SELECT * FROM users
     WHERE email = $1 AND deleted_at IS NULL`,
    [email],
  );
  return rows[0] ?? null;
}

export async function createUser(email) {
  const { rows } = await pool.query(
    `INSERT INTO users (email)
     VALUES ($1)
     RETURNING *`,
    [email],
  );
  return rows[0];
}

export async function updateLastLogin(userId) {
  await pool.query(
    `UPDATE users SET last_login_at = NOW() WHERE id = $1`,
    [userId],
  );
}

export async function findUserById(userId) {
  const { rows } = await pool.query(
    `SELECT * FROM users
     WHERE id = $1 AND deleted_at IS NULL`,
    [userId],
  );
  return rows[0] ?? null;
}
