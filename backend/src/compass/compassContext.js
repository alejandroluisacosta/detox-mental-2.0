import pool from '../db/db.js';
import { listCompassItems, listRecentlyDismissedSuggestions } from './compass.service.js';
import { COMPASS_LIMITS } from './parseCompassItem.js';

const LABEL_PREFIX = { goal: 'G', memory: 'M' };

/**
 * What the summary prompt and the suggestion parser share: items with short
 * labels (G1..G3, M1..M15) instead of ids, per-kind counts, caps, and the
 * recently dismissed texts.
 */
export const buildCompassContext = ({ items = [], dismissed = [] } = {}) => {
  const labelled = [];
  for (const kind of ['goal', 'memory']) {
    items
      .filter((item) => item.kind === kind)
      .forEach((item, index) => {
        labelled.push({
          label: `${LABEL_PREFIX[kind]}${index + 1}`,
          id: item.id,
          kind,
          content: item.content,
        });
      });
  }
  return {
    labelled,
    counts: {
      goal: labelled.filter((item) => item.kind === 'goal').length,
      memory: labelled.filter((item) => item.kind === 'memory').length,
    },
    limits: COMPASS_LIMITS,
    dismissed: dismissed.filter((entry) => typeof entry?.text === 'string' && entry.text),
  };
};

export const loadCompassContext = async (userId, now = new Date(), db = pool) => {
  const [items, dismissed] = await Promise.all([
    listCompassItems(userId, db),
    listRecentlyDismissedSuggestions(userId, now, db),
  ]);
  return buildCompassContext({ items, dismissed });
};
