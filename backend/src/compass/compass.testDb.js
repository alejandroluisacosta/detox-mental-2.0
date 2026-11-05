import crypto from 'node:crypto';

/**
 * In-memory stand-in for the Compass tables (and the journal summary tables the
 * summary controller touches). It enforces what Postgres enforces for these
 * queries: user_id scoping, the per-kind cap in the conditional INSERT, CHECK
 * constraints, ON DELETE CASCADE from items to suggestions, the dismissed_at
 * window, UUID syntax, and transaction rollback.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const pgError = (code, message) => Object.assign(new Error(message), { code });

const assertUuid = (value) => {
  if (value !== null && value !== undefined && !UUID_RE.test(String(value))) {
    throw pgError('22P02', `invalid input syntax for type uuid: "${value}"`);
  }
};

const checkContent = (content, { nullable = false } = {}) => {
  if (content === null || content === undefined) {
    if (nullable) return;
    throw pgError('23502', 'null value in column "content"');
  }
  if (content.trim().length === 0 || content.length > 200) {
    throw pgError('23514', 'violates check constraint content_length');
  }
};

export const memoryCompassDb = ({ clock = () => new Date() } = {}) => {
  let state = {
    items: [],
    suggestions: [],
    summaries: [],
    entries: [],
    attempts: [],
  };
  let snapshot = null;
  const statements = [];

  const clone = (value) => structuredClone(value);
  const countKind = (userId, kind) =>
    state.items.filter((i) => i.user_id === userId && i.kind === kind).length;

  const query = async (sql, params = []) => {
    const text = sql.replace(/\s+/g, ' ').trim();
    statements.push(text);

    if (text === 'BEGIN') {
      snapshot = clone(state);
      return { rows: [] };
    }
    if (text === 'COMMIT') {
      snapshot = null;
      return { rows: [] };
    }
    if (text === 'ROLLBACK') {
      if (snapshot) state = snapshot;
      snapshot = null;
      return { rows: [] };
    }

    // ---- compass_items ----
    if (/^SELECT id, kind, content, created_at, updated_at FROM compass_items WHERE user_id = \$1 ORDER BY/.test(text)) {
      const [userId] = params;
      return {
        rows: state.items
          .filter((i) => i.user_id === userId)
          .sort((a, b) => a.created_at - b.created_at || a.seq - b.seq)
          .map(clone),
      };
    }
    if (/^SELECT COUNT\(\*\)::int AS count FROM compass_items WHERE user_id = \$1$/.test(text)) {
      const [userId] = params;
      return { rows: [{ count: state.items.filter((i) => i.user_id === userId).length }] };
    }
    if (/^INSERT INTO compass_items \(user_id, kind, content\) SELECT \$1, \$2, \$3 WHERE \(SELECT COUNT\(\*\) FROM compass_items WHERE user_id = \$1 AND kind = \$2\) < \$4/.test(text)) {
      const [userId, kind, content, limit] = params;
      if (!['memory', 'goal'].includes(kind)) throw pgError('23514', 'kind check');
      if (countKind(userId, kind) >= limit) return { rows: [] };
      checkContent(content);
      const now = clock();
      const row = {
        id: crypto.randomUUID(),
        user_id: userId,
        kind,
        content,
        created_at: now,
        updated_at: now,
        seq: state.items.length + state.suggestions.length,
      };
      state.items.push(row);
      return { rows: [clone(row)] };
    }
    if (/^SELECT id, kind, content, created_at, updated_at FROM compass_items WHERE id = \$2 AND user_id = \$1 FOR UPDATE$/.test(text)) {
      const [userId, itemId] = params;
      assertUuid(itemId);
      const row = state.items.find((i) => i.id === itemId && i.user_id === userId);
      return { rows: row ? [clone(row)] : [] };
    }
    if (/^UPDATE compass_items SET content = \$3, updated_at = NOW\(\) WHERE id = \$2 AND user_id = \$1/.test(text)) {
      const [userId, itemId, content] = params;
      assertUuid(itemId);
      const row = state.items.find((i) => i.id === itemId && i.user_id === userId);
      if (!row) return { rows: [] };
      checkContent(content);
      row.content = content;
      row.updated_at = clock();
      return { rows: [clone(row)] };
    }
    if (/^DELETE FROM compass_items WHERE id = \$2 AND user_id = \$1/.test(text)) {
      const [userId, itemId] = params;
      assertUuid(itemId);
      const row = state.items.find((i) => i.id === itemId && i.user_id === userId);
      if (!row) return { rows: [] };
      state.items = state.items.filter((i) => i !== row);
      // ON DELETE CASCADE on compass_suggestions.target_item_id
      state.suggestions = state.suggestions.filter((s) => s.target_item_id !== row.id);
      return { rows: [{ id: row.id }] };
    }

    // ---- compass_suggestions ----
    if (/^SELECT id, summary_id, action, kind, target_item_id, target_content, content, status, created_at FROM compass_suggestions WHERE user_id = \$1 AND summary_id = \$2 AND status = 'pending'/.test(text)) {
      const [userId, summaryId] = params;
      return {
        rows: state.suggestions
          .filter((s) => s.user_id === userId && s.summary_id === summaryId && s.status === 'pending')
          .sort((a, b) => a.created_at - b.created_at || a.seq - b.seq)
          .map(clone),
      };
    }
    if (/^SELECT id, summary_id, action, kind, target_item_id, target_content, content, status, created_at FROM compass_suggestions WHERE id = \$2 AND user_id = \$1 AND status = 'pending' FOR UPDATE$/.test(text)) {
      const [userId, suggestionId] = params;
      assertUuid(suggestionId);
      const row = state.suggestions.find(
        (s) => s.id === suggestionId && s.user_id === userId && s.status === 'pending',
      );
      return { rows: row ? [clone(row)] : [] };
    }
    if (/^SELECT COUNT\(\*\)::int AS count FROM compass_suggestions s JOIN journal_weekly_summaries w ON w.id = s.summary_id WHERE s.user_id = \$1 AND s.status = 'pending' AND w.week_start = \$2$/.test(text)) {
      const [userId, weekStart] = params;
      const count = state.suggestions.filter((s) => {
        if (s.user_id !== userId || s.status !== 'pending') return false;
        const summary = state.summaries.find((w) => w.id === s.summary_id);
        return summary?.week_start === weekStart;
      }).length;
      return { rows: [{ count }] };
    }
    if (/^SELECT action, kind, content, target_content, dismissed_at FROM compass_suggestions WHERE user_id = \$1 AND status = 'dismissed' AND dismissed_at >= \$2 ORDER BY dismissed_at DESC LIMIT \$3$/.test(text)) {
      const [userId, since, limit] = params;
      return {
        rows: state.suggestions
          .filter((s) => s.user_id === userId && s.status === 'dismissed' && s.dismissed_at >= since)
          .sort((a, b) => b.dismissed_at - a.dismissed_at)
          .slice(0, limit)
          .map(clone),
      };
    }
    if (/^DELETE FROM compass_suggestions WHERE user_id = \$1 AND status = 'pending'$/.test(text)) {
      const [userId] = params;
      state.suggestions = state.suggestions.filter(
        (s) => !(s.user_id === userId && s.status === 'pending'),
      );
      return { rows: [] };
    }
    if (/^DELETE FROM compass_suggestions WHERE user_id = \$1 AND status = 'dismissed' AND dismissed_at < \$2$/.test(text)) {
      const [userId, before] = params;
      state.suggestions = state.suggestions.filter(
        (s) => !(s.user_id === userId && s.status === 'dismissed' && s.dismissed_at < before),
      );
      return { rows: [] };
    }
    if (/^DELETE FROM compass_suggestions WHERE id = \$2 AND user_id = \$1$/.test(text)) {
      const [userId, suggestionId] = params;
      state.suggestions = state.suggestions.filter(
        (s) => !(s.id === suggestionId && s.user_id === userId),
      );
      return { rows: [] };
    }
    if (/^INSERT INTO compass_suggestions \(user_id, summary_id, action, kind, target_item_id, target_content, content\) VALUES/.test(text)) {
      const [userId, summaryId, action, kind, targetItemId, targetContent, content] = params;
      if (!['add', 'update', 'remove'].includes(action)) throw pgError('23514', 'action check');
      if (!['memory', 'goal'].includes(kind)) throw pgError('23514', 'kind check');
      if ((action === 'add') !== (targetItemId === null)) throw pgError('23514', 'target check');
      if ((action === 'remove') !== (content === null)) throw pgError('23514', 'content check');
      checkContent(content, { nullable: true });
      if (!state.summaries.some((w) => w.id === summaryId)) {
        throw pgError('23503', 'summary_id foreign key');
      }
      if (targetItemId && !state.items.some((i) => i.id === targetItemId)) {
        throw pgError('23503', 'target_item_id foreign key');
      }
      const row = {
        id: crypto.randomUUID(),
        user_id: userId,
        summary_id: summaryId,
        action,
        kind,
        target_item_id: targetItemId,
        target_content: targetContent,
        content,
        status: 'pending',
        created_at: clock(),
        dismissed_at: null,
        seq: state.items.length + state.suggestions.length,
      };
      state.suggestions.push(row);
      return { rows: [clone(row)] };
    }
    if (/^UPDATE compass_suggestions SET status = 'dismissed', dismissed_at = NOW\(\) WHERE id = \$2 AND user_id = \$1 AND status = 'pending'/.test(text)) {
      const [userId, suggestionId] = params;
      assertUuid(suggestionId);
      const row = state.suggestions.find(
        (s) => s.id === suggestionId && s.user_id === userId && s.status === 'pending',
      );
      if (!row) return { rows: [] };
      row.status = 'dismissed';
      row.dismissed_at = clock();
      return { rows: [{ id: row.id }] };
    }

    // ---- journal summary tables (summary controller) ----
    if (/^SELECT id, content, topics, created_at FROM journal_entries WHERE user_id = \$1 AND created_at >= \$2 AND created_at < \$3/.test(text)) {
      const [userId, start, end] = params;
      return {
        rows: state.entries
          .filter((e) => e.user_id === userId && e.created_at >= start && e.created_at < end)
          .map(clone),
      };
    }
    if (/^SELECT COUNT\(\*\)::int AS count FROM journal_entries WHERE user_id = \$1 AND created_at >= \$2 AND created_at < \$3$/.test(text)) {
      const [userId, start, end] = params;
      const count = state.entries.filter(
        (e) => e.user_id === userId && e.created_at >= start && e.created_at < end,
      ).length;
      return { rows: [{ count }] };
    }
    if (/^SELECT COUNT\(\*\)::int AS count FROM journal_summary_generate_attempts/.test(text)) {
      const [userId, kind, since] = params;
      const count = state.attempts.filter(
        (a) => a.user_id === userId && a.kind === kind && a.created_at >= since,
      ).length;
      return { rows: [{ count }] };
    }
    if (/^INSERT INTO journal_summary_generate_attempts/.test(text)) {
      const [userId, kind] = params;
      state.attempts.push({ user_id: userId, kind, created_at: clock() });
      return { rows: [] };
    }
    if (/^SELECT id, user_id, week_start, .* FROM journal_weekly_summaries WHERE user_id = \$1 AND week_start = \$2$/.test(text)) {
      const [userId, weekStart] = params;
      const row = state.summaries.find((w) => w.user_id === userId && w.week_start === weekStart);
      return { rows: row ? [clone(row)] : [] };
    }
    if (/^INSERT INTO journal_weekly_summaries .* ON CONFLICT \(user_id, week_start\) DO UPDATE/.test(text)) {
      const [
        userId, weekStart, weekEnd, periodStart, periodEnd, summaryText, mainTopics,
        bestQuote, bestQuoteEntryId, socraticText, machiavelliText, entryCount, modelId,
        locale, limit,
      ] = params;
      const fields = {
        week_end: weekEnd,
        period_start: periodStart,
        period_end: periodEnd,
        summary_text: summaryText,
        main_topics: mainTopics,
        best_quote: bestQuote,
        best_quote_entry_id: bestQuoteEntryId,
        socratic_text: socraticText,
        machiavelli_text: machiavelliText,
        entry_count: entryCount,
        model_id: modelId,
        locale,
        created_at: clock(),
      };
      const existing = state.summaries.find((w) => w.user_id === userId && w.week_start === weekStart);
      if (existing) {
        if (existing.generation_count >= limit) return { rows: [] };
        Object.assign(existing, fields, {
          generation_count: existing.generation_count + 1,
          feedback_count: 0,
        });
        return { rows: [clone(existing)] };
      }
      const row = {
        id: crypto.randomUUID(),
        user_id: userId,
        week_start: weekStart,
        ...fields,
        generation_count: 1,
        feedback_count: 0,
      };
      state.summaries.push(row);
      return { rows: [clone(row)] };
    }
    if (/^UPDATE journal_weekly_summaries SET summary_text = \$3/.test(text)) {
      const [userId, weekStart, summaryText, mainTopics, bestQuote, bestQuoteEntryId,
        socraticText, machiavelliText, entryCount, modelId, locale] = params;
      const row = state.summaries.find(
        (w) => w.user_id === userId && w.week_start === weekStart && w.feedback_count === 0,
      );
      if (!row) return { rows: [] };
      Object.assign(row, {
        summary_text: summaryText,
        main_topics: mainTopics,
        best_quote: bestQuote,
        best_quote_entry_id: bestQuoteEntryId,
        socratic_text: socraticText,
        machiavelli_text: machiavelliText,
        entry_count: entryCount,
        model_id: modelId,
        locale,
        feedback_count: 1,
        created_at: clock(),
      });
      return { rows: [clone(row)] };
    }

    throw new Error(`memoryCompassDb: unexpected query: ${text}`);
  };

  const db = {
    query,
    async connect() {
      return { query, release() {} };
    },
    statements,
    get items() {
      return state.items;
    },
    get suggestions() {
      return state.suggestions;
    },
    get summaries() {
      return state.summaries;
    },
    seedItem({ userId, kind, content, createdAt = clock() }) {
      const row = {
        id: crypto.randomUUID(),
        user_id: userId,
        kind,
        content,
        created_at: createdAt,
        updated_at: createdAt,
        seq: state.items.length + state.suggestions.length,
      };
      state.items.push(row);
      return row;
    },
    seedSummary({ userId, weekStart, generationCount = 1, feedbackCount = 0 }) {
      const row = {
        id: crypto.randomUUID(),
        user_id: userId,
        week_start: weekStart,
        week_end: weekStart,
        period_start: clock(),
        period_end: clock(),
        summary_text: 'Earlier summary.',
        main_topics: [],
        best_quote: 'q',
        best_quote_entry_id: null,
        socratic_text: 's',
        machiavelli_text: 'm',
        entry_count: 2,
        model_id: 'test-model',
        locale: 'en',
        generation_count: generationCount,
        feedback_count: feedbackCount,
        created_at: clock(),
      };
      state.summaries.push(row);
      return row;
    },
    seedSuggestion({
      userId,
      summaryId,
      action = 'add',
      kind = 'memory',
      targetItemId = null,
      targetContent = null,
      content = action === 'remove' ? null : 'Suggested text.',
      status = 'pending',
      dismissedAt = null,
    }) {
      const row = {
        id: crypto.randomUUID(),
        user_id: userId,
        summary_id: summaryId,
        action,
        kind,
        target_item_id: targetItemId,
        target_content: targetContent,
        content,
        status,
        created_at: clock(),
        dismissed_at: dismissedAt,
        seq: state.items.length + state.suggestions.length,
      };
      state.suggestions.push(row);
      return row;
    },
    seedEntry({ userId, content, createdAt, topics = [] }) {
      const row = { id: crypto.randomUUID(), user_id: userId, content, topics, created_at: createdAt };
      state.entries.push(row);
      return row;
    },
  };
  return db;
};
