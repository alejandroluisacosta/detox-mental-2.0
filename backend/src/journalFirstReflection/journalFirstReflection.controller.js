import pool from '../db/db.js';
import { allowFirstReflection } from '../rateLimit/limits.js';
import { clientIp } from '../rateLimit/clientIp.js';
import { generateFirstReflectionContent } from '../journalSummaries/journalSummaries.generation.js';
import { journalMessage } from '../i18n/journalMessages.js';
import { localeFromRequest } from '../i18n/locale.js';

export const FIRST_REFLECTION_MIN_CHARS = 200;
export const FIRST_REFLECTION_MAX_CHARS = 3000;

const rateLimited = (locale) => ({
  code: 'first_reflection_rate_limited',
  message: journalMessage(locale, 'firstReflectionLimited'),
});

const validateContent = (raw, locale) => {
  const content = typeof raw === 'string' ? raw.trim() : '';
  if (content.length < FIRST_REFLECTION_MIN_CHARS) {
    return {
      ok: false,
      body: {
        code: 'first_reflection_too_short',
        message: journalMessage(locale, 'firstReflectionTooShort', {
          min: FIRST_REFLECTION_MIN_CHARS,
        }),
      },
    };
  }
  if (content.length > FIRST_REFLECTION_MAX_CHARS) {
    return {
      ok: false,
      body: {
        code: 'first_reflection_too_long',
        message: journalMessage(locale, 'firstReflectionTooLong', {
          max: FIRST_REFLECTION_MAX_CHARS,
        }),
      },
    };
  }
  return { ok: true, content };
};

/**
 * Anonymous first-entry reflection. Stores nothing: the entry and the
 * reflection only travel in the request and response. The only write is the
 * rate-limit event, keyed by a hashed IP. Never log the request body or a
 * provider error message, since either can carry the visitor's text.
 */
export const postFirstReflection = async (req, res) => {
  const locale = localeFromRequest(req);

  if (process.env.FIRST_REFLECTION_DISABLED === 'true') {
    return res.status(503).json({
      message: journalMessage(locale, 'firstReflectionUnavailable'),
    });
  }

  const validation = validateContent(req.body?.content, locale);
  if (!validation.ok) {
    return res.status(400).json(validation.body);
  }

  const allowed = await allowFirstReflection({ ip: clientIp(req), db: req.db ?? pool });
  if (!allowed) {
    return res.status(429).json(rateLimited(locale));
  }

  const generate = req.generateFirstReflection ?? generateFirstReflectionContent;
  const abort = new AbortController();
  const onClose = () => abort.abort();
  req.on('close', onClose);

  try {
    const generated = await generate({
      content: validation.content,
      locale,
      signal: abort.signal,
    });
    return res.status(200).json({
      reflection: {
        summaryText: generated.summaryText,
        mainTopics: generated.mainTopics,
        bestQuote: generated.bestQuote,
        socraticText: generated.socraticText,
        machiavelliText: generated.machiavelliText,
      },
    });
  } catch (err) {
    console.error('[first-reflection POST]', err?.code || err?.name || 'error');
    if (err?.code === 'missing_hf_token') {
      return res.status(503).json({
        message: journalMessage(locale, 'firstReflectionUnavailable'),
      });
    }
    if (err?.code === 'summary_timeout') {
      return res.status(504).json({
        code: 'summary_timeout',
        message: journalMessage(locale, 'summaryTimeout'),
      });
    }
    return res.status(502).json({
      message: journalMessage(locale, 'firstReflectionFailed'),
    });
  } finally {
    req.removeListener('close', onClose);
  }
};
