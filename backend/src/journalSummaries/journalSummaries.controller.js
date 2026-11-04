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
  reviseWeeklySummary,
  countRecentGenerateAttempts,
  countRecentReviseAttempts,
  recordGenerateAttempt,
  recordReviseAttempt,
  MAX_GENERATE_ATTEMPTS_IN_WINDOW,
  MAX_REVISE_ATTEMPTS_IN_WINDOW,
} from './journalSummaries.service.js';
import {
  generateWeeklySummaryContent,
  generateWeeklySummaryRevision,
} from './journalSummaries.generation.js';
import { parseRevisionComments } from './parseRevisionComments.js';
import pool from '../db/db.js';
import { loadCompassContext } from '../compass/compassContext.js';
import {
  countCompassItems,
  listPendingSuggestionsForSummary,
  replacePendingSuggestions,
} from '../compass/compass.service.js';
import { journalMessage } from '../i18n/journalMessages.js';
import { localeFromRequest } from '../i18n/locale.js';

const dbFor = (req) => req.db ?? pool;

/**
 * Store the new suggestions in place of the summary's pending ones.
 * The summary is already saved, so a failure here is logged, not surfaced.
 */
const saveCompassSuggestions = async (userId, summaryId, suggestions, db) => {
  try {
    return await replacePendingSuggestions(
      { userId, summaryId, suggestions: suggestions ?? [] },
      db,
    );
  } catch (err) {
    console.error('[journal-summaries compass save]', err);
    return [];
  }
};

const quotaExhausted = (locale) => ({
  message: journalMessage(locale, 'summaryQuotaExhausted'),
});

const feedbackExhausted = (locale) => ({
  code: 'summary_feedback_exhausted',
  message: journalMessage(locale, 'summaryFeedbackExhausted'),
});

const rateLimited = (locale) => ({
  code: 'summary_rate_limited',
  message: journalMessage(locale, 'summaryTryLater'),
});

const sendGenerationFailure = (res, locale, genErr) => {
  if (genErr.code === 'missing_hf_token') {
    return res.status(503).json({
      message: journalMessage(locale, 'summaryServiceUnconfigured'),
    });
  }
  if (genErr.code === 'summary_timeout') {
    return res.status(504).json({
      code: 'summary_timeout',
      message: journalMessage(locale, 'summaryTimeout'),
    });
  }
  return res.status(502).json({
    message: journalMessage(locale, 'summaryGenerateFailed'),
  });
};

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

const buildCurrentPayload = async (userId, now = new Date(), db = pool) => {
  const quotaWeek = getWeekBounds(now);
  const range = getRollingEntryRange(now);
  const [entryCount, summary, compassItemCount] = await Promise.all([
    countJournalEntriesInRange(userId, range.periodStart, range.periodEnd, db),
    getWeeklySummaryForUser(userId, quotaWeek.weekStart, db),
    countCompassItems(userId, db),
  ]);
  const { weekStart, weekEnd } = displayRange(summary, range);
  const compassSuggestions = summary
    ? await listPendingSuggestionsForSummary(userId, summary.id, db)
    : [];

  return {
    weekStart,
    weekEnd,
    quota: buildQuotaPayload(summary?.generationCount ?? 0, now),
    entryCount,
    minEntries: MIN_ENTRIES_FOR_SUMMARY,
    summary,
    compassSuggestions,
    compassItemCount,
  };
};

export const getCurrentJournalSummary = async (req, res) => {
  const locale = localeFromRequest(req);
  try {
    const payload = await buildCurrentPayload(req.user.id, new Date(), dbFor(req));
    return res.status(200).json(payload);
  } catch (err) {
    console.error('[journal-summaries GET current]', err);
    return res.status(500).json({ message: journalMessage(locale, 'summaryLoadFailed') });
  }
};

export const postCurrentJournalSummary = async (req, res) => {
  const locale = localeFromRequest(req);
  const db = dbFor(req);
  try {
    const now = new Date();
    const quotaWeek = getWeekBounds(now);
    const range = getRollingEntryRange(now);

    const existing = await getWeeklySummaryForUser(
      req.user.id,
      quotaWeek.weekStart,
      db,
    );
    if ((existing?.generationCount ?? 0) >= SUMMARY_GENERATIONS_PER_WEEK) {
      return res.status(429).json(quotaExhausted(locale));
    }

    const recentAttempts = await countRecentGenerateAttempts(req.user.id, now, db);
    if (recentAttempts >= MAX_GENERATE_ATTEMPTS_IN_WINDOW) {
      return res.status(429).json(rateLimited(locale));
    }

    const entries = await listJournalEntriesInRange(
      req.user.id,
      range.periodStart,
      range.periodEnd,
      db,
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

    await recordGenerateAttempt(req.user.id, db);
    const compass = await loadCompassContext(req.user.id, now, db);

    const abort = new AbortController();
    const onClose = () => abort.abort();
    req.on('close', onClose);

    let generated;
    try {
      generated = await generateWeeklySummaryContent({
        entries,
        weekStart: range.rangeStart,
        weekEnd: range.rangeEnd,
        locale,
        signal: abort.signal,
        compass,
        complete: req.summaryCompletion,
      });
    } catch (genErr) {
      console.error('[journal-summaries POST generate]', genErr);
      return sendGenerationFailure(res, locale, genErr);
    } finally {
      req.removeListener('close', onClose);
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
    }, db);

    if (!summary) {
      return res.status(429).json(quotaExhausted(locale));
    }

    const compassSuggestions = await saveCompassSuggestions(
      req.user.id,
      summary.id,
      generated.compassSuggestions,
      db,
    );

    return res.status(201).json({
      summary,
      weekStart: range.rangeStart,
      weekEnd: range.rangeEnd,
      compassSuggestions,
    });
  } catch (err) {
    console.error('[journal-summaries POST current]', err);
    return res.status(500).json({ message: journalMessage(locale, 'summaryCreateFailed') });
  }
};

export const postCurrentJournalSummaryRevision = async (req, res) => {
  const locale = localeFromRequest(req);
  const db = dbFor(req);
  try {
    const now = new Date();
    const quotaWeek = getWeekBounds(now);
    const range = getRollingEntryRange(now);

    const existing = await getWeeklySummaryForUser(
      req.user.id,
      quotaWeek.weekStart,
      db,
    );
    if (!existing) {
      return res.status(404).json({
        message: journalMessage(locale, 'summaryNotFound'),
      });
    }
    if (existing.feedbackCount >= 1) {
      return res.status(429).json(feedbackExhausted(locale));
    }

    const parsedComments = parseRevisionComments(req.body?.comments);
    if (!parsedComments.ok) {
      return res.status(400).json({
        code: parsedComments.error,
        message: journalMessage(locale, 'summaryInvalidComments'),
      });
    }

    const recentAttempts = await countRecentReviseAttempts(req.user.id, now, db);
    if (recentAttempts >= MAX_REVISE_ATTEMPTS_IN_WINDOW) {
      return res.status(429).json(rateLimited(locale));
    }

    const entries = await listJournalEntriesInRange(
      req.user.id,
      range.periodStart,
      range.periodEnd,
      db,
    );

    await recordReviseAttempt(req.user.id, db);
    const compass = await loadCompassContext(req.user.id, now, db);

    const abort = new AbortController();
    const onClose = () => abort.abort();
    req.on('close', onClose);

    let generated;
    try {
      generated = await generateWeeklySummaryRevision({
        entries,
        weekStart: range.rangeStart,
        weekEnd: range.rangeEnd,
        locale,
        generationCount: existing.generationCount,
        previousSummary: existing,
        comments: parsedComments.value,
        signal: abort.signal,
        compass,
        complete: req.summaryCompletion,
      });
    } catch (genErr) {
      console.error('[journal-summaries POST revise]', genErr);
      return sendGenerationFailure(res, locale, genErr);
    } finally {
      req.removeListener('close', onClose);
    }

    const summary = await reviseWeeklySummary({
      userId: req.user.id,
      weekStart: quotaWeek.weekStart,
      summaryText: generated.summaryText,
      mainTopics: generated.mainTopics,
      bestQuote: generated.bestQuote,
      bestQuoteEntryId: generated.bestQuoteEntryId,
      socraticText: generated.socraticText,
      machiavelliText: generated.machiavelliText,
      entryCount: entries.length,
      modelId: generated.modelId,
      locale,
    }, db);

    if (!summary) {
      return res.status(429).json(feedbackExhausted(locale));
    }

    const compassSuggestions = await saveCompassSuggestions(
      req.user.id,
      summary.id,
      generated.compassSuggestions,
      db,
    );

    return res.status(201).json({
      summary,
      weekStart: range.rangeStart,
      weekEnd: range.rangeEnd,
      compassSuggestions,
    });
  } catch (err) {
    console.error('[journal-summaries POST revise]', err);
    return res.status(500).json({
      message: journalMessage(locale, 'summaryReviseFailed'),
    });
  }
};
