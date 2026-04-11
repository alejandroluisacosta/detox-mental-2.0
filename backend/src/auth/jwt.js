import jwt from 'jsonwebtoken';

const JWT_MAX_AGE_SECONDS = 14 * 24 * 60 * 60; // 14 days

export function signJwt(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: JWT_MAX_AGE_SECONDS,
  });
}

export function verifyJwt(token) {
  // Throws if expired or invalid signature
  return jwt.verify(token, process.env.JWT_SECRET);
}

export const COOKIE_NAME = 'auth_token';

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
  path: '/',
  maxAge: JWT_MAX_AGE_SECONDS * 1000, // express uses milliseconds
};
