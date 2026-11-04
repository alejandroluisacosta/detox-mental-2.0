import pool from '../db/db.js';
import { journalMessage } from '../i18n/journalMessages.js';
import { localeFromRequest } from '../i18n/locale.js';
import { getWeekBounds } from '../journalSummaries/summaryWeek.js';
import {
  acceptSuggestion,
  countPendingSuggestionsForWeek,
  createCompassItem,
  deleteCompassItem,
  dismissSuggestion,
  listCompassItems,
  updateCompassItem,
} from './compass.service.js';
import { COMPASS_LIMITS, isCompassKind, parseCompassContent } from './parseCompassItem.js';

const dbFor = (req) => req.db ?? pool;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A malformed id can never match a row: answer 404 instead of a uuid cast error. */
const idParam = (req) => {
  const raw = typeof req.params?.id === 'string' ? req.params.id.trim() : '';
  return UUID_RE.test(raw) ? raw : null;
};

const contentError = (locale, messageKey) =>
  journalMessage(locale, messageKey, { max: COMPASS_LIMITS.chars });

const fullMessage = (locale, kind) =>
  journalMessage(locale, kind === 'goal' ? 'compassGoalsFull' : 'compassMemoriesFull');

const itemNotFound = (res, locale) =>
  res.status(404).json({ message: journalMessage(locale, 'compassItemNotFound') });

const suggestionNotFound = (res, locale) =>
  res.status(404).json({ message: journalMessage(locale, 'compassSuggestionNotFound') });

export const getCompass = async (req, res) => {
  const locale = localeFromRequest(req);
  const db = dbFor(req);
  try {
    const { weekStart } = getWeekBounds(new Date());
    const [items, pendingSuggestionCount] = await Promise.all([
      listCompassItems(req.user.id, db),
      countPendingSuggestionsForWeek(req.user.id, weekStart, db),
    ]);
    return res.status(200).json({
      goals: items.filter((item) => item.kind === 'goal'),
      memories: items.filter((item) => item.kind === 'memory'),
      limits: { ...COMPASS_LIMITS },
      pendingSuggestionCount,
    });
  } catch (err) {
    console.error('[compass GET]', err);
    return res.status(500).json({ message: journalMessage(locale, 'compassLoadFailed') });
  }
};

export const postCompassItem = async (req, res) => {
  const locale = localeFromRequest(req);
  const kind = req.body?.kind;
  if (!isCompassKind(kind)) {
    return res.status(400).json({ message: journalMessage(locale, 'compassKindInvalid') });
  }
  const parsed = parseCompassContent(req.body?.content);
  if (!parsed.ok) {
    return res.status(400).json({ message: contentError(locale, parsed.messageKey) });
  }

  try {
    const item = await createCompassItem(
      { userId: req.user.id, kind, content: parsed.content, limit: COMPASS_LIMITS[kind] },
      dbFor(req),
    );
    if (!item) {
      return res.status(409).json({ code: 'compass_full', message: fullMessage(locale, kind) });
    }
    return res.status(201).json({ item });
  } catch (err) {
    console.error('[compass POST item]', err);
    return res.status(500).json({ message: journalMessage(locale, 'compassSaveFailed') });
  }
};

export const patchCompassItem = async (req, res) => {
  const locale = localeFromRequest(req);
  const itemId = idParam(req);
  if (!itemId) return itemNotFound(res, locale);

  const parsed = parseCompassContent(req.body?.content);
  if (!parsed.ok) {
    return res.status(400).json({ message: contentError(locale, parsed.messageKey) });
  }

  try {
    const item = await updateCompassItem(
      { userId: req.user.id, itemId, content: parsed.content },
      dbFor(req),
    );
    if (!item) return itemNotFound(res, locale);
    return res.status(200).json({ item });
  } catch (err) {
    console.error('[compass PATCH item]', err);
    return res.status(500).json({ message: journalMessage(locale, 'compassSaveFailed') });
  }
};

export const deleteCompassItemForUser = async (req, res) => {
  const locale = localeFromRequest(req);
  const itemId = idParam(req);
  if (!itemId) return itemNotFound(res, locale);

  try {
    const deletedId = await deleteCompassItem({ userId: req.user.id, itemId }, dbFor(req));
    if (!deletedId) return itemNotFound(res, locale);
    return res.status(204).send();
  } catch (err) {
    console.error('[compass DELETE item]', err);
    return res.status(500).json({ message: journalMessage(locale, 'compassDeleteFailed') });
  }
};

export const acceptCompassSuggestion = async (req, res) => {
  const locale = localeFromRequest(req);
  const suggestionId = idParam(req);
  if (!suggestionId) return suggestionNotFound(res, locale);

  const rawContent = req.body?.content;
  let content;
  if (rawContent !== undefined && rawContent !== null) {
    const parsed = parseCompassContent(rawContent);
    if (!parsed.ok) {
      return res.status(400).json({ message: contentError(locale, parsed.messageKey) });
    }
    content = parsed.content;
  }

  try {
    const result = await acceptSuggestion(
      { userId: req.user.id, suggestionId, content, limits: COMPASS_LIMITS },
      dbFor(req),
    );
    if (result.error === 'not_found') return suggestionNotFound(res, locale);
    if (result.error === 'content_not_allowed') {
      return res.status(400).json({
        message: journalMessage(locale, 'compassSuggestionContentNotAllowed'),
      });
    }
    if (result.error === 'stale') {
      return res.status(409).json({
        code: 'compass_suggestion_stale',
        message: journalMessage(locale, 'compassSuggestionStale'),
      });
    }
    if (result.error === 'full') {
      return res.status(409).json({
        code: 'compass_full',
        message: fullMessage(locale, result.kind),
      });
    }
    if (result.removedItemId) {
      return res.status(200).json({ removedItemId: result.removedItemId });
    }
    return res.status(200).json({ item: result.item });
  } catch (err) {
    console.error('[compass POST accept]', err);
    return res.status(500).json({ message: journalMessage(locale, 'compassSuggestionFailed') });
  }
};

export const dismissCompassSuggestion = async (req, res) => {
  const locale = localeFromRequest(req);
  const suggestionId = idParam(req);
  if (!suggestionId) return suggestionNotFound(res, locale);

  try {
    const dismissedId = await dismissSuggestion(
      { userId: req.user.id, suggestionId },
      dbFor(req),
    );
    if (!dismissedId) return suggestionNotFound(res, locale);
    return res.status(204).send();
  } catch (err) {
    console.error('[compass POST dismiss]', err);
    return res.status(500).json({ message: journalMessage(locale, 'compassSuggestionFailed') });
  }
};
