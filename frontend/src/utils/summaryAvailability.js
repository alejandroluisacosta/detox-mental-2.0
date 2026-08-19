/**
 * Derive create/display state from GET /journal-summaries/current payload.
 * Gating lives here so the backend stays a pure generator.
 */
export const resolveSummaryAvailability = (payload) => {
  const windowOpen = Boolean(payload?.window?.open);
  const windowEnforced = Boolean(payload?.window?.enforced);
  const entryCount = payload?.entryCount ?? 0;
  const minEntries = payload?.minEntries ?? 2;
  const serverSummary = payload?.summary ?? null;
  const opensAtMs = payload?.window?.opensAt
    ? new Date(payload.window.opensAt).getTime()
    : null;

  const stale =
    windowOpen &&
    serverSummary?.createdAt &&
    opensAtMs != null &&
    !Number.isNaN(opensAtMs)
      ? new Date(serverSummary.createdAt).getTime() < opensAtMs
      : false;

  const displayedSummary = stale ? null : serverSummary;
  const canCreate =
    windowOpen && entryCount >= minEntries && !displayedSummary;

  return {
    windowOpen,
    windowEnforced,
    entryCount,
    minEntries,
    stale,
    displayedSummary,
    canCreate,
  };
};
