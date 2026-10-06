import { getSessions } from '../data/content/index.js';

export const overlaySessionState = (catalog, previous = []) => {
  const prevById = new Map(previous.map((session) => [session.id, session]));
  return catalog.map((session) => {
    const prev = prevById.get(session.id);
    if (!prev) {
      return { ...session, exercise: { ...session.exercise } };
    }
    return {
      ...session,
      isBlocked: prev.isBlocked,
      exercise: {
        ...session.exercise,
        isBlocked: prev.exercise?.isBlocked ?? session.exercise.isBlocked,
      },
    };
  });
};

/**
 * Starts from the locale catalog and marks sessions as unblocked when present in `unlockedIds`.
 * Exercise payloads stay as in the template (persisted later).
 */
export function mergeUnlockedSessions(unlockedIds, locale) {
  const catalog = getSessions(locale);
  const set =
    unlockedIds instanceof Set ? unlockedIds : new Set(unlockedIds ?? []);

  return catalog.map((session) => ({
    ...session,
    exercise: { ...session.exercise },
    isBlocked: set.has(session.id) ? false : session.isBlocked,
  }));
}
