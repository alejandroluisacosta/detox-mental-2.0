export const JOURNAL_MEMORY_SEEN_KEY = 'journalMemorySeenDate';
export const MEMORY_SWIPE_THRESHOLD_PX = 40;

const MEMORY_ENDPOINT = '/auth/me/journal-memory';

/** The UTC date (`YYYY-MM-DD`) the memory was last opened on this device, or null. */
export const readMemorySeenDate = () => {
  try {
    return window.localStorage.getItem(JOURNAL_MEMORY_SEEN_KEY);
  } catch {
    return null;
  }
};

export const writeMemorySeenDate = (date) => {
  try {
    window.localStorage.setItem(JOURNAL_MEMORY_SEEN_KEY, date);
  } catch {
    // Blocked storage only means the chip stays fresh.
  }
};

/** Card to land on after a drag: one step per swipe past the threshold, clamped to the ends. */
export const snapMemoryIndex = ({ index, count, drag, threshold = MEMORY_SWIPE_THRESHOLD_PX }) => {
  if (drag <= -threshold && index < count - 1) return index + 1;
  if (drag >= threshold && index > 0) return index - 1;
  return index;
};

/** Endpoint path; `allowDateOverride` forwards the page's `?date=` for dev testing. */
export const journalMemoryPath = (search, allowDateOverride) => {
  if (!allowDateOverride) return MEMORY_ENDPOINT;
  const date = new URLSearchParams(search).get('date');
  return date ? `${MEMORY_ENDPOINT}?date=${encodeURIComponent(date)}` : MEMORY_ENDPOINT;
};

export const MEMORY_SHEET_DISMISS_PX = 120;
export const MEMORY_SHEET_FLICK_PX_PER_MS = 0.5;

/** Whether a downward drag on the sheet handle should close it: far enough, or a quick flick. */
export const shouldDismissMemorySheet = ({ drag, velocity }) =>
  drag >= MEMORY_SHEET_DISMISS_PX || (drag > 0 && velocity >= MEMORY_SHEET_FLICK_PX_PER_MS);
