import { generateLoginToken, hashToken, extractEmailFromToken } from './token.js';
import { signJwt, COOKIE_NAME, COOKIE_OPTIONS } from './jwt.js';
import { sendMagicLinkEmail } from './email.service.js';
import {
  storeLoginToken,
  findValidToken,
  markTokenUsedAndAssignUser,
  findUserByEmail,
  createUser,
  updateLastLogin,
} from './auth.service.js';

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3001';

export async function login(req, res) {
  const rawEmail = req.body?.email;

  if (!rawEmail || typeof rawEmail !== 'string') {
    return res.status(400).json({ message: 'Un email es requerido.' });
  }

  const email = rawEmail.trim().toLowerCase();

  try {
    const rawToken = generateLoginToken(email);
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + FIFTEEN_MINUTES_MS);

    await storeLoginToken(tokenHash, expiresAt);

    await sendMagicLinkEmail(email, rawToken);
  } catch (err) {
    console.error('[auth/login]', err);
    // Intentional fall-through: always return generic response to prevent email enumeration
  }

  return res.status(200).json({
    message: 'Si existe un usuario con ese email, se ha enviado un enlace de login.',
  });
}

export async function verify(req, res) {
  const rawToken = req.query.token;

  if (!rawToken || typeof rawToken !== 'string') {
    return res.redirect(`${FRONTEND_ORIGIN}/auth/error?reason=invalid_token`);
  }

  const email = extractEmailFromToken(rawToken);
  if (!email) {
    return res.redirect(`${FRONTEND_ORIGIN}/auth/error?reason=invalid_token`);
  }

  try {
    const tokenHash = hashToken(rawToken);
    const tokenRecord = await findValidToken(tokenHash);

    if (!tokenRecord) {
      return res.redirect(`${FRONTEND_ORIGIN}/auth/error?reason=invalid_or_expired_token`);
    }

    let user = await findUserByEmail(email);
    if (!user) {
      user = await createUser(email);
    }

    await markTokenUsedAndAssignUser(tokenHash, user.id);
    await updateLastLogin(user.id);

    const token = signJwt({ user_id: user.id, role: user.role });
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);

    return res.redirect(`${FRONTEND_ORIGIN}/course?auth=success`);
  } catch (err) {
    console.error('[auth/verify]', err);
    return res.redirect(`${FRONTEND_ORIGIN}/auth/error?reason=server_error`);
  }
}

export function logout(_req, res) {
  res.clearCookie(COOKIE_NAME, {
    path: '/',
    ...(COOKIE_OPTIONS.domain ? { domain: COOKIE_OPTIONS.domain } : {}),
  });
  return res.status(200).json({ message: 'Logged out.' });
}

/** Session bootstrap for the SPA. Requires a valid JWT cookie (see requireAuth). */
export function me(req, res) {
  const { id, email, role, created_at } = req.user;
  return res.status(200).json({ id, email, role, created_at });
}
