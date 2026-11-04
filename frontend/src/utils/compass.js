export const COMPASS_ITEM_MAX_CHARS = 200;
export const COMPASS_NUDGE_STORAGE_KEY = 'compassNudgeDismissed';

/** Locale key for a suggestion's tag, e.g. "New memory" or "Remove goal". */
export const compassTagKey = (suggestion) =>
  `summary.compassTag.${suggestion.action}.${suggestion.kind}`;

/** Locale key for the resolved card after accepting. */
export const compassAcceptedKey = (action) => {
  if (action === 'update') return 'summary.compassUpdated';
  if (action === 'remove') return 'summary.compassRemoved';
  return 'summary.compassAdded';
};

/** How an accepted suggestion changes the number of Compass items. */
export const compassItemDelta = (action) => {
  if (action === 'add') return 1;
  if (action === 'remove') return -1;
  return 0;
};

export const readCompassNudgeDismissed = () => {
  try {
    return window.localStorage.getItem(COMPASS_NUDGE_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

export const writeCompassNudgeDismissed = () => {
  try {
    window.localStorage.setItem(COMPASS_NUDGE_STORAGE_KEY, '1');
  } catch {
    // Storage blocked (private mode): the nudge simply comes back next visit.
  }
};
