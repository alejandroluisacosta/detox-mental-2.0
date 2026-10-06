import { describe, expect, test } from 'vitest';
import { getSessions } from '../data/content/index.js';
import { mergeUnlockedSessions, overlaySessionState } from './mergeUnlockedSessions.js';

describe('mergeUnlockedSessions', () => {
  test('unlocks persisted ids on the locale catalog without changing Spanish copy', () => {
    const sessions = mergeUnlockedSessions([4], 'es');
    const fourth = sessions.find((session) => session.id === 4);
    expect(fourth.isBlocked).toBe(false);
    expect(fourth.title).toBe('Los pensamientos son inofensivos');
    expect(sessions.find((session) => session.id === 5).isBlocked).toBe(true);
  });

  test('keeps unlock flags when the catalog language changes', () => {
    const catalog = getSessions('en');
    const previous = getSessions('es').map((session) =>
      session.id === 4 ? { ...session, isBlocked: false } : session,
    );
    const next = overlaySessionState(catalog, previous);
    expect(next.find((session) => session.id === 4).isBlocked).toBe(false);
    expect(next.find((session) => session.id === 5).isBlocked).toBe(true);
    expect(next.find((session) => session.id === 4).title).toBe(
      catalog.find((session) => session.id === 4).title,
    );
  });

  test('uses the same unlock overlay when English still falls back to Spanish', () => {
    const esSessions = mergeUnlockedSessions([4], 'es');
    const enSessions = mergeUnlockedSessions([4], 'en');
    expect(enSessions.find((session) => session.id === 4).isBlocked).toBe(false);
    expect(enSessions.find((session) => session.id === 4).title).toBe(
      esSessions.find((session) => session.id === 4).title,
    );
  });
});
