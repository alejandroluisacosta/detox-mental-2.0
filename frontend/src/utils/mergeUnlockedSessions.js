import { sessionsData } from "../data";

/**
 * Starts from the static catalog and marks sessions as unblocked when present in `unlockedIds`.
 * Exercise payloads stay as in the template (persisted later).
 */
export function mergeUnlockedSessions(unlockedIds) {
  const set =
    unlockedIds instanceof Set ? unlockedIds : new Set(unlockedIds ?? []);

  return sessionsData.map((session) => ({
    ...session,
    exercise: { ...session.exercise },
    isBlocked: set.has(session.id) ? false : session.isBlocked,
  }));
}
