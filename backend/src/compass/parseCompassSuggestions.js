import { compassTextKey, isCompassKind, parseCompassContent } from './parseCompassItem.js';

export const MAX_SUGGESTIONS_PER_SUMMARY = 3;

const ACTIONS = ['add', 'update', 'remove'];

/**
 * Turn the model's optional `compass` field into suggestions the server can store.
 * Lenient: anything invalid is dropped, never thrown, so a bad suggestion can
 * never fail the summary it came with.
 *
 * @param {unknown} raw The `compass` value from the model JSON.
 * @param {{ labelled: Array<{label, id, kind, content}>, counts, limits }} context
 */
export const parseCompassSuggestions = (raw, context) => {
  if (!Array.isArray(raw) || !context) return [];

  const byLabel = new Map(
    context.labelled.map((item) => [item.label.toUpperCase(), item]),
  );
  const existingKeys = new Set(context.labelled.map((item) => compassTextKey(item.content)));
  const seenKeys = new Set();
  const touchedTargets = new Set();
  const counts = { ...context.counts };
  const suggestions = [];

  for (const entry of raw) {
    if (suggestions.length >= MAX_SUGGESTIONS_PER_SUMMARY) break;
    if (!entry || typeof entry !== 'object' || !ACTIONS.includes(entry.action)) continue;

    const { action } = entry;
    let target = null;
    if (action !== 'add') {
      target = typeof entry.target === 'string' ? byLabel.get(entry.target.trim().toUpperCase()) : null;
      if (!target || touchedTargets.has(target.id)) continue;
    }

    if (action === 'remove') {
      touchedTargets.add(target.id);
      suggestions.push({
        action,
        kind: target.kind,
        targetItemId: target.id,
        targetContent: target.content,
        content: null,
      });
      continue;
    }

    const parsed = parseCompassContent(entry.content);
    if (!parsed.ok) continue;
    const key = compassTextKey(parsed.content);
    if (existingKeys.has(key) || seenKeys.has(key)) continue;

    if (action === 'add') {
      if (!isCompassKind(entry.kind)) continue;
      if (counts[entry.kind] >= context.limits[entry.kind]) continue;
      counts[entry.kind] += 1;
    } else {
      touchedTargets.add(target.id);
    }

    seenKeys.add(key);
    suggestions.push({
      action,
      kind: action === 'add' ? entry.kind : target.kind,
      targetItemId: target?.id ?? null,
      targetContent: target?.content ?? null,
      content: parsed.content,
    });
  }

  return suggestions;
};
