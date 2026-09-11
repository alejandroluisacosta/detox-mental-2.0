export const COMMENT_SECTIONS = [
  'summaryText',
  'bestQuote',
  'socraticText',
  'machiavelliText',
];

export const MAX_REVISION_COMMENTS = 20;
export const MAX_COMMENT_NOTE_LENGTH = 1000;
export const MAX_QUOTED_TEXT_LENGTH = 4000;

const asTrimmedString = (value) =>
  typeof value === 'string' ? value.trim() : '';

/**
 * Validate the revise endpoint comment list.
 * @returns {{ ok: true, value: object[] } | { ok: false, error: string }}
 */
export const parseRevisionComments = (raw) => {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { ok: false, error: 'comments_required' };
  }
  if (raw.length > MAX_REVISION_COMMENTS) {
    return { ok: false, error: 'too_many_comments' };
  }

  const comments = [];
  const seenTargets = new Set();
  for (const item of raw) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      return { ok: false, error: 'invalid_comment' };
    }
    if (!COMMENT_SECTIONS.includes(item.section)) {
      return { ok: false, error: 'invalid_section' };
    }

    const note = asTrimmedString(item.note);
    if (!note || note.length > MAX_COMMENT_NOTE_LENGTH) {
      return { ok: false, error: 'invalid_note' };
    }

    const quotedText = asTrimmedString(item.quotedText).slice(
      0,
      MAX_QUOTED_TEXT_LENGTH,
    );
    const targetKey = `${item.section}:${quotedText}`;
    if (seenTargets.has(targetKey)) {
      return { ok: false, error: 'duplicate_comment' };
    }
    seenTargets.add(targetKey);

    comments.push({
      section: item.section,
      note,
      ...(quotedText ? { quotedText } : {}),
    });
  }

  return { ok: true, value: comments };
};

/** Model-facing JSON for the previous summary (same keys as generate output). */
export const toRevisionSummaryJson = (summary) => ({
  summary: summary?.summaryText ?? '',
  mainTopics: Array.isArray(summary?.mainTopics) ? summary.mainTopics : [],
  bestQuote: summary?.bestQuote ?? '',
  socratic: summary?.socraticText ?? '',
  machiavelli: summary?.machiavelliText ?? '',
});
