// Must match the backend limits in journalFirstReflection.controller.js.
export const FIRST_REFLECTION_MIN_CHARS = 200;
export const FIRST_REFLECTION_MAX_CHARS = 3000;

// Only the reflection is kept, never the entry text, and only in this browser.
export const FIRST_REFLECTION_STORAGE_KEY = 'detoxFirstReflection';
export const FIRST_REFLECTION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const removeStored = () => {
  try {
    window.localStorage.removeItem(FIRST_REFLECTION_STORAGE_KEY);
  } catch {
    // Storage unavailable; nothing to remove.
  }
};

/** Returns the stored reflection, or null when missing, expired or unreadable. */
export const readFirstReflection = (now = Date.now()) => {
  let stored;
  try {
    stored = JSON.parse(window.localStorage.getItem(FIRST_REFLECTION_STORAGE_KEY));
  } catch {
    removeStored();
    return null;
  }

  const savedAt = Date.parse(stored?.savedAt);
  if (!stored?.reflection || Number.isNaN(savedAt)) return null;
  if (now - savedAt > FIRST_REFLECTION_TTL_MS) {
    removeStored();
    return null;
  }
  return stored.reflection;
};

export const saveFirstReflection = (reflection, now = new Date()) => {
  try {
    window.localStorage.setItem(
      FIRST_REFLECTION_STORAGE_KEY,
      JSON.stringify({ reflection, savedAt: now.toISOString() }),
    );
  } catch {
    // Private mode or full storage: the preview still renders this time.
  }
};
