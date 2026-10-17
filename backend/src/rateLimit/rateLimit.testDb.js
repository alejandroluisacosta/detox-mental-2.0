/**
 * In-memory stand-in for the rate_limit_events table. It enforces the same
 * bucket / subject / created_at filters the real SQL applies, so tests fail
 * when the service queries the wrong window.
 */
export const memoryRateLimitDb = () => {
  const rows = [];

  return {
    rows,
    async query(sql, params = []) {
      const text = sql.replace(/\s+/g, ' ');

      if (/^SELECT COUNT/.test(text)) {
        const [bucket, subject, oldest, ...windowStarts] = params;
        const scoped = rows.filter(
          (r) => r.bucket === bucket && r.subject === subject && r.created_at >= oldest,
        );
        const row = {};
        windowStarts.forEach((start, i) => {
          row[`c${i}`] = scoped.filter((r) => r.created_at >= start).length;
        });
        return { rows: [row] };
      }

      if (/^INSERT INTO rate_limit_events/.test(text)) {
        const [bucket, subject, createdAt] = params;
        rows.push({ bucket, subject, created_at: createdAt });
        return { rows: [] };
      }

      if (/^DELETE FROM rate_limit_events/.test(text)) {
        const [cutoff] = params;
        for (let i = rows.length - 1; i >= 0; i -= 1) {
          if (rows[i].created_at < cutoff) rows.splice(i, 1);
        }
        return { rows: [] };
      }

      throw new Error(`memoryRateLimitDb: unexpected query: ${text}`);
    },
  };
};
