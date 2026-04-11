import { verifyJwt, COOKIE_NAME } from './jwt.js';
import { findUserById } from './auth.service.js';

export async function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }

  let payload;
  try {
    payload = verifyJwt(token); // throws if expired or invalid
  } catch {
    return res.status(401).json({ message: 'Unauthorized.' });
  }

  try {
    const user = await findUserById(payload.user_id);

    if (!user) {
      // Covers both "user not found" and soft-deleted users (deleted_at IS NOT NULL)
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    req.user = user;
    return next();
  } catch (err) {
    console.error('[auth/middleware]', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}
