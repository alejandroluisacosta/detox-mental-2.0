import { normalizeLlmOutput } from '../onboarding/parsers/normalizeLlmOutput.js';

const MAX_TOPICS = 5;

/** Pull a JSON object out of raw model text (fences / surrounding prose). */
export const extractJsonObject = (raw) => {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : trimmed;

  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start === -1 || end <= start) return null;
    try {
      return JSON.parse(candidate.slice(start, end + 1));
    } catch {
      return null;
    }
  }
};

const asNonEmptyString = (value) => {
  if (typeof value !== 'string') return null;
  const normalized = normalizeLlmOutput(value);
  return normalized.length > 0 ? normalized : null;
};

const asTopicList = (value) => {
  if (!Array.isArray(value)) return [];
  const topics = [];
  for (const item of value) {
    if (typeof item !== 'string') continue;
    const topic = item.trim().replace(/\s+/g, ' ');
    if (!topic) continue;
    if (!topics.includes(topic)) topics.push(topic);
    if (topics.length >= MAX_TOPICS) break;
  }
  return topics;
};

/**
 * Validate and normalize model JSON into the three summary sections.
 * @returns {{ ok: true, value } | { ok: false, error: string }}
 */
export const parseSummaryOutput = (raw) => {
  const parsed = extractJsonObject(raw);
  if (!parsed || typeof parsed !== 'object') {
    return { ok: false, error: 'invalid_json' };
  }

  const summary = asNonEmptyString(parsed.summary);
  const bestQuote = asNonEmptyString(parsed.bestQuote);
  const socratic = asNonEmptyString(parsed.socratic);
  const mainTopics = asTopicList(parsed.mainTopics);

  if (!summary || !bestQuote || !socratic) {
    return { ok: false, error: 'missing_fields' };
  }

  return {
    ok: true,
    value: {
      summaryText: summary,
      mainTopics,
      bestQuote,
      socraticText: socratic,
    },
  };
};

const normalizeForMatch = (text) =>
  String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

/** Best-effort match of quote text to a source entry id. */
export const findBestQuoteEntryId = (quote, entries) => {
  const needle = normalizeForMatch(quote);
  if (!needle || !Array.isArray(entries)) return null;

  for (const entry of entries) {
    const haystack = normalizeForMatch(entry.content);
    if (haystack.includes(needle)) return entry.id;
  }

  // Soften: quote may be a shortened fragment with ellipsis
  const compact = needle.replace(/[.…]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (compact.length >= 12) {
    for (const entry of entries) {
      const haystack = normalizeForMatch(entry.content);
      if (haystack.includes(compact)) return entry.id;
    }
  }

  return null;
};
