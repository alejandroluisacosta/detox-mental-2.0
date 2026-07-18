import {
  createJournalEntry,
  listJournalEntriesForUser,
} from './journalEntries.service.js';

export const getJournalEntries = async (req, res) => {
  try {
    const entries = await listJournalEntriesForUser(req.user.id);
    return res.status(200).json({ entries });
  } catch (err) {
    console.error('[journal-entries GET]', err);
    return res.status(500).json({ message: 'Error al cargar el diario.' });
  }
};

export const postJournalEntry = async (req, res) => {
  const raw = req.body?.content;
  const content = typeof raw === 'string' ? raw.trim() : '';

  if (!content) {
    return res.status(400).json({ message: 'El texto del diario no puede estar vacío.' });
  }

  try {
    const entry = await createJournalEntry(req.user.id, content);
    return res.status(201).json({ entry });
  } catch (err) {
    console.error('[journal-entries POST]', err);
    return res.status(500).json({ message: 'No se pudo guardar la entrada.' });
  }
};
