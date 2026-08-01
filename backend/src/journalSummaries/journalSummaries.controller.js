import {
  buildWindowPayload,
  getWeekBounds,
  isSummaryWindowOpen,
  MIN_ENTRIES_FOR_SUMMARY,
} from './summaryWindow.js';
import {
  countJournalEntriesInRange,
  createWeeklySummary,
  getWeeklySummaryForUser,
  listJournalEntriesInRange,
} from './journalSummaries.service.js';
import { generateWeeklySummaryContent } from './journalSummaries.generation.js';

const uniqueViolation = (err) =>
  err?.code === '23505' || /duplicate key/i.test(String(err?.message ?? ''));

const buildCurrentPayload = async (userId, now = new Date()) => {
  const bounds = getWeekBounds(now);
  const window = buildWindowPayload(now);
  const [entryCount, summary] = await Promise.all([
    countJournalEntriesInRange(userId, bounds.periodStart, bounds.periodEnd),
    getWeeklySummaryForUser(userId, bounds.weekStart),
  ]);

  const canCreate =
    window.open &&
    !summary &&
    entryCount >= MIN_ENTRIES_FOR_SUMMARY;

  return {
    weekStart: bounds.weekStart,
    weekEnd: bounds.weekEnd,
    window,
    entryCount,
    minEntries: MIN_ENTRIES_FOR_SUMMARY,
    canCreate,
    summary,
  };
};

export const getCurrentJournalSummary = async (req, res) => {
  try {
    const payload = await buildCurrentPayload(req.user.id);
    return res.status(200).json(payload);
  } catch (err) {
    console.error('[journal-summaries GET current]', err);
    return res.status(500).json({ message: 'Error al cargar el resumen.' });
  }
};

export const postCurrentJournalSummary = async (req, res) => {
  try {
    const now = new Date();
    if (!isSummaryWindowOpen(now)) {
      return res.status(403).json({
        message:
          'El resumen semanal solo se puede crear el domingo de 12:00 a 18:00 (hora de Madrid).',
      });
    }

    const bounds = getWeekBounds(now);
    const existing = await getWeeklySummaryForUser(
      req.user.id,
      bounds.weekStart,
    );
    if (existing) {
      return res.status(409).json({
        message: 'Ya existe un resumen para esta semana.',
        summary: existing,
      });
    }

    const entries = await listJournalEntriesInRange(
      req.user.id,
      bounds.periodStart,
      bounds.periodEnd,
    );

    if (entries.length < MIN_ENTRIES_FOR_SUMMARY) {
      return res.status(422).json({
        message: `Necesitas al menos ${MIN_ENTRIES_FOR_SUMMARY} entradas esta semana para crear el resumen.`,
        entryCount: entries.length,
        minEntries: MIN_ENTRIES_FOR_SUMMARY,
      });
    }

    let generated;
    try {
      generated = await generateWeeklySummaryContent({
        entries,
        weekStart: bounds.weekStart,
        weekEnd: bounds.weekEnd,
      });
    } catch (genErr) {
      console.error('[journal-summaries POST generate]', genErr);
      if (genErr.code === 'missing_hf_token') {
        return res.status(503).json({
          message: 'El servicio de resumen no está configurado.',
        });
      }
      return res.status(502).json({
        message:
          'No se pudo generar el resumen. Inténtalo de nuevo en unos momentos.',
      });
    }

    try {
      const summary = await createWeeklySummary({
        userId: req.user.id,
        weekStart: bounds.weekStart,
        weekEnd: bounds.weekEnd,
        periodStart: bounds.periodStart,
        periodEnd: bounds.periodEnd,
        summaryText: generated.summaryText,
        mainTopics: generated.mainTopics,
        bestQuote: generated.bestQuote,
        bestQuoteEntryId: generated.bestQuoteEntryId,
        socraticText: generated.socraticText,
        entryCount: entries.length,
        modelId: generated.modelId,
      });
      return res.status(201).json({ summary });
    } catch (insertErr) {
      if (uniqueViolation(insertErr)) {
        const summary = await getWeeklySummaryForUser(
          req.user.id,
          bounds.weekStart,
        );
        return res.status(409).json({
          message: 'Ya existe un resumen para esta semana.',
          summary,
        });
      }
      throw insertErr;
    }
  } catch (err) {
    console.error('[journal-summaries POST current]', err);
    return res.status(500).json({ message: 'Error al crear el resumen.' });
  }
};
