import crypto from 'crypto';
import pool from '../db/db.js';
import { hashToken } from '../auth/token.js';
import {
  isValidSessionId,
  listSessionUnblockIdsForUser,
  recordSessionUnblock,
  findUnlockCodeHash,
} from './sessionUnblocks.service.js';

const dbFor = (req) => req.db ?? pool;

/**
 * Constant-time comparison of two hex-encoded HMAC hashes. Returns false
 * (rather than throwing) when the lengths differ, so a malformed or
 * missing stored hash never crashes the request.
 */
const hashesMatch = (a, b) => {
  const bufA = Buffer.from(a, 'hex');
  const bufB = Buffer.from(b, 'hex');
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
};

export async function getSessionUnblocks(req, res) {
  try {
    const sessionIds = await listSessionUnblockIdsForUser(req.user.id);
    return res.status(200).json({ sessionIds });
  } catch (err) {
    console.error('[session-unblocks GET]', err);
    return res.status(500).json({ message: 'Error al cargar sesiones desbloqueadas.' });
  }
}

export async function postSessionUnblock(req, res) {
  const raw = req.body?.sessionId;
  const sessionId = typeof raw === 'string' ? parseInt(raw, 10) : raw;
  const code = req.body?.code;

  if (!isValidSessionId(sessionId)) {
    return res.status(400).json({ message: 'sessionId inválido.' });
  }

  if (typeof code !== 'string' || !code) {
    return res.status(403).json({ message: 'Código inválido.' });
  }

  try {
    const db = dbFor(req);
    const storedHash = await findUnlockCodeHash(sessionId, db);

    if (!storedHash || !hashesMatch(hashToken(code), storedHash)) {
      return res.status(403).json({ message: 'Código inválido.' });
    }

    await recordSessionUnblock(req.user.id, sessionId, db);
    return res.status(201).json({ ok: true, sessionId });
  } catch (err) {
    console.error('[session-unblocks POST]', err);
    return res.status(500).json({ message: 'No se pudo guardar el desbloqueo.' });
  }
}
