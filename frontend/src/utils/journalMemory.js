// Stores the UTC day the memory was last opened, so the chip turns quiet for
// the rest of that day and is fresh again the next one with no reset needed.
export const JOURNAL_MEMORY_SEEN_KEY = 'journalMemorySeenOn';

// Horizontal drag, in px, needed to move to the next or previous entry.
export const SWIPE_THRESHOLD_PX = 40;

const defaultStorage = () => (typeof window === 'undefined' ? null : window.localStorage);

export const isJournalMemorySeen = (today, storage = defaultStorage()) => {
  try {
    return storage?.getItem(JOURNAL_MEMORY_SEEN_KEY) === today;
  } catch {
    return false;
  }
};

export const markJournalMemorySeen = (today, storage = defaultStorage()) => {
  try {
    storage?.setItem(JOURNAL_MEMORY_SEEN_KEY, today);
  } catch {
    // Private mode or blocked storage: the chip simply stays fresh.
  }
};

export const nextIndexAfterSwipe = (index, dragPx, count) => {
  if (dragPx <= -SWIPE_THRESHOLD_PX && index < count - 1) return index + 1;
  if (dragPx >= SWIPE_THRESHOLD_PX && index > 0) return index - 1;
  return index;
};
