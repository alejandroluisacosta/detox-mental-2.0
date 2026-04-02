import crypto from 'crypto';

/**
 * Generates a secure login token that encodes the email.
 *
 * The raw token is a base64url-encoded JSON payload containing the normalized
 * email and a cryptographically random nonce. This allows us to recover the
 * email at verification time without adding an email column to magic_link_tokens.
 *
 * The token_hash stored in the DB is an HMAC-SHA256 of the raw token using
 * MAGIC_LINK_SECRET — so even if the DB is leaked, tokens cannot be brute-forced
 * without the secret.
 */
export function generateLoginToken(email) {
  const nonce = crypto.randomBytes(32).toString('hex');
  const payload = Buffer.from(JSON.stringify({ email, nonce })).toString('base64url');
  return payload;
}

export function hashToken(rawToken) {
  return crypto
    .createHmac('sha256', process.env.MAGIC_LINK_SECRET)
    .update(rawToken)
    .digest('hex');
}

export function extractEmailFromToken(rawToken) {
  try {
    const decoded = JSON.parse(Buffer.from(rawToken, 'base64url').toString());
    return typeof decoded.email === 'string' ? decoded.email : null;
  } catch {
    return null;
  }
}
