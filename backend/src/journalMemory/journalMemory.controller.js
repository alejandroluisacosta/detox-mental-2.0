import pool from '../db/db.js';
import { listJournalEntriesOnUtcDateForUser } from '../journalEntries/journalEntries.service.js';
import { journalMessage } from '../i18n/journalMessages.js';
import { localeFromRequest } from '../i18n/locale.js';
import { anniversaryLookups, isValidIsoDate } from './anniversary.js';

const dbFor = (req) => req.db ?? pool;

const todayUtc = () => new Date().toISOString().slice(0, 10);

// Outside production, `?date=YYYY-MM-DD` pretends today is that day so the
// feature can be tested against real entries without waiting for an anniversary.
const resolveToday = (req) => {
  const override = req.query?.date;
  if (process.env.NODE_ENV === 'production' || override === undefined) {
    return { ok: true, today: todayUtc() };
  }
  if (typeof override !== 'string' || !isValidIsoDate(override)) {
    return { ok: false };
  }
  return { ok: true, today: override };
};

export const getJournalMemory = async (req, res) => {
  const locale = localeFromRequest(req);
  const resolved = resolveToday(req);
  if (!resolved.ok) {
    return res.status(400).json({ message: journalMessage(locale, 'invalidMemoryDate') });
  }
  const { today } = resolved;

  try {
    for (const { horizon, date } of anniversaryLookups(today)) {
      const entries = await listJournalEntriesOnUtcDateForUser(req.user.id, date, dbFor(req));
      if (entries.length > 0) {
        return res.status(200).json({ today, memory: { horizon, date, entries } });
      }
    }
    return res.status(200).json({ today, memory: null });
  } catch (err) {
    console.error('[journal-memory GET]', err);
    return res.status(500).json({ message: journalMessage(locale, 'memoryLoadFailed') });
  }
};
