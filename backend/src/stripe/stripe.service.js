import pool from '../db/db.js';

export async function findUserByStripeCustomerId(stripeCustomerId) {
  const { rows } = await pool.query(
    `SELECT * FROM users WHERE stripe_customer_id = $1 AND deleted_at IS NULL`,
    [stripeCustomerId],
  );
  return rows[0] ?? null;
}

export async function updateUserStripeCustomerId(userId, stripeCustomerId) {
  await pool.query(
    `UPDATE users SET stripe_customer_id = $1 WHERE id = $2`,
    [stripeCustomerId, userId],
  );
}

export async function updateUserPaidStatus(userId, paymentIntentId) {
  await pool.query(
    `UPDATE users
     SET role = 'paid', stripe_payment_intent_id = $1, paid_at = NOW()
     WHERE id = $2`,
    [paymentIntentId, userId],
  );
}

export async function unlockAllSessionsForUser(userId) {
  await pool.query(
    `INSERT INTO user_unblocked_sessions (user_id, session_id)
     SELECT $1, generate_series(1, 15)
     ON CONFLICT DO NOTHING`,
    [userId],
  );
}
