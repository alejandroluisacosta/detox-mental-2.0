import {
  buildQuotaPayload,
  getWeekBounds,
  MIN_ENTRIES_FOR_SUMMARY,
  SUMMARY_GENERATIONS_PER_WEEK,
} from './summaryWeek.js';
import {
  listJournalEntriesInRange,
  countJournalEntriesInRange,
  getWeeklySummaryForUser,
  upsertWeeklySummary,
} from './journalSummaries.service.js';
import { generateWeeklySummaryContent } from './journalSummaries.generation.js';
import { journalMessage } from '../i18n/journalMessages.js';
import { localeFromRequest } from '../i18n/locale.js';

const quotaExhausted = (locale) => ({
  message: journalMessage(locale, 'summaryQuotaExhausted'),
});

const buildCurrentPayload = async (userId, now = new Date()) => {
  const bounds = getWeekBounds(now);
  const [entryCount, summary] = await Promise.all([
    countJournalEntriesInRange(userId, bounds.periodStart, bounds.periodEnd),
    getWeeklySummaryForUser(userId, bounds.weekStart),
  ]);

  return {
    weekStart: bounds.weekStart,
    weekEnd: bounds.weekEnd,
    quota: buildQuotaPayload(summary?.generationCount ?? 0, now),
    entryCount,
    minEntries: MIN_ENTRIES_FOR_SUMMARY,
    summary,
  };
};

export const getCurrentJournalSummary = async (req, res) => {
  const locale = localeFromRequest(req);
  try {
    const payload = await buildCurrentPayload(req.user.id);
    return res.status(200).json(payload);
  } catch (err) {
    console.error('[journal-summaries GET current]', err);
    return res.status(500).json({ message: journalMessage(locale, 'summaryLoadFailed') });
  }
};

export const postCurrentJournalSummary = async (req, res) => {
  const locale = localeFromRequest(req);
  try {
    const now = new Date();
    const bounds = getWeekBounds(now);

    const existing = await getWeeklySummaryForUser(req.user.id, bounds.weekStart);
    if ((existing?.generationCount ?? 0) >= SUMMARY_GENERATIONS_PER_WEEK) {
      return res.status(429).json(quotaExhausted(locale));
    }

    const entries = await listJournalEntriesInRange(
      req.user.id,
      bounds.periodStart,
      bounds.periodEnd,
    );

    if (entries.length < MIN_ENTRIES_FOR_SUMMARY) {
      return res.status(422).json({
        message: journalMessage(locale, 'needEntries', {
          minEntries: MIN_ENTRIES_FOR_SUMMARY,
        }),
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
        locale,
      });
    } catch (genErr) {
      console.error('[journal-summaries POST generate]', genErr);
      if (genErr.code === 'missing_hf_token') {
        return res.status(503).json({
          message: journalMessage(locale, 'summaryServiceUnconfigured'),
        });
      }
      return res.status(502).json({
        message: journalMessage(locale, 'summaryGenerateFailed'),
      });
    }

    const summary = await upsertWeeklySummary({
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
      machiavelliText: generated.machiavelliText,
      entryCount: entries.length,
      modelId: generated.modelId,
      locale,
      limit: SUMMARY_GENERATIONS_PER_WEEK,
    });

    if (!summary) {
      return res.status(429).json(quotaExhausted(locale));
    }

    return res.status(201).json({ summary });
  } catch (err) {
    console.error('[journal-summaries POST current]', err);
    return res.status(500).json({ message: journalMessage(locale, 'summaryCreateFailed') });
  }
};
