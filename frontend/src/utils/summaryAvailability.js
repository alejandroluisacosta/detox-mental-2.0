/**
 * Derive create/display state from GET /journal-summaries/current payload.
 * Quota numbers come from the server; this helper only decides which CTAs to show.
 */
export const resolveSummaryAvailability = (payload) => {
  const entryCount = payload?.entryCount ?? 0;
  const minEntries = payload?.minEntries ?? 2;
  const limit = payload?.quota?.limit ?? 2;
  const used = payload?.quota?.used ?? 0;
  const remaining = payload?.quota?.remaining ?? Math.max(limit - used, 0);
  const displayedSummary = payload?.summary ?? null;

  return {
    entryCount,
    minEntries,
    limit,
    used,
    remaining,
    displayedSummary,
    canCreate: !displayedSummary && entryCount >= minEntries && remaining > 0,
    canRegenerate: Boolean(displayedSummary) && remaining > 0,
  };
};
