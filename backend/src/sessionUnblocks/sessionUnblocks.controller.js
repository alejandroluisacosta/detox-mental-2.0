import {
  isValidSessionId,
  listSessionUnblockIdsForUser,
  recordSessionUnblock,
} from './sessionUnblocks.service.js';

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

  if (!isValidSessionId(sessionId)) {
    return res.status(400).json({ message: 'sessionId inválido.' });
  }

  try {
    await recordSessionUnblock(req.user.id, sessionId);
    return res.status(201).json({ ok: true, sessionId });
  } catch (err) {
    console.error('[session-unblocks POST]', err);
    return res.status(500).json({ message: 'No se pudo guardar el desbloqueo.' });
  }
}
