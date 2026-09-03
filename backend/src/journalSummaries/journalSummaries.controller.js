import {
  buildQuotaPayload,
  getRollingEntryRange,
  getWeekBounds,
  MIN_ENTRIES_FOR_SUMMARY,
  SUMMARY_GENERATIONS_PER_WEEK,
  zonedDateString,
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

const displayRange = (summary, range) => {
  if (!summary?.periodStart || !summary?.periodEnd) {
    return { weekStart: range.rangeStart, weekEnd: range.rangeEnd };
  }

  const periodEndMs = new Date(summary.periodEnd).getTime();
  const lastIncluded = Number.isNaN(periodEndMs)
    ? new Date()
    : new Date(periodEndMs - 1);

  return {
    weekStart: zonedDateString(new Date(summary.periodStart)),
    weekEnd: zonedDateString(lastIncluded),
  };
};

const buildCurrentPayload = async (userId, now = new Date()) => {
  const quotaWeek = getWeekBounds(now);
  const range = getRollingEntryRange(now);
  const [entryCount, summary] = await Promise.all([
    countJournalEntriesInRange(userId, range.periodStart, range.periodEnd),
    getWeeklySummaryForUser(userId, quotaWeek.weekStart),
  ]);
  const { weekStart, weekEnd } = displayRange(summary, range);

  return {
    weekStart,
    weekEnd,
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
    const quotaWeek = getWeekBounds(now);
    const range = getRollingEntryRange(now);

    const existing = await getWeeklySummaryForUser(
      req.user.id,
      quotaWeek.weekStart,
    );
    if ((existing?.generationCount ?? 0) >= SUMMARY_GENERATIONS_PER_WEEK) {
      return res.status(429).json(quotaExhausted(locale));
    }

    const entries = await listJournalEntriesInRange(
      req.user.id,
      range.periodStart,
      range.periodEnd,
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
        weekStart: range.rangeStart,
        weekEnd: range.rangeEnd,
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
      weekStart: quotaWeek.weekStart,
      weekEnd: quotaWeek.weekEnd,
      periodStart: range.periodStart,
      periodEnd: range.periodEnd,
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

    return res.status(201).json({
      summary,
      weekStart: range.rangeStart,
      weekEnd: range.rangeEnd,
    });
  } catch (err) {
    console.error('[journal-summaries POST current]', err);
    return res.status(500).json({ message: journalMessage(locale, 'summaryCreateFailed') });
  }
};
