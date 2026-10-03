import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { getSessions } from "../data/content/index.js";
import { mergeUnlockedSessions, overlaySessionState } from "../utils/mergeUnlockedSessions.js";
import { apiFetch } from "../api/client.js";
import { useAuth } from "./AuthContext.jsx";
import { useLocale } from "./LocaleContext.jsx";

export const SessionsContext = createContext(null);

const SessionsProvider = ({ children }) => {
  const { user, status } = useAuth();
  const { locale } = useLocale();
  const catalog = useMemo(() => getSessions(locale), [locale]);
  const [sessions, setSessions] = useState(catalog);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  useEffect(() => {
    setSessions((prev) => overlaySessionState(catalog, prev));
  }, [catalog]);
  
  const reloadSessions = useCallback(async () => {
    if (status === "loading") return;

    if (!user) {
      setSessions(getSessions(locale));
      setSessionsLoading(false);
      return;
    }

    try {
      const res = await apiFetch("/auth/me/unblocked-sessions");
      if (!res.ok) throw new Error("unblocked fetch failed");
      const data = await res.json();
      const ids = Array.isArray(data.sessionIds) ? data.sessionIds : [];
      setSessions(mergeUnlockedSessions(ids, locale));
    } catch (e) {
      console.error("[sessions]", e);
      setSessions(getSessions(locale));
    } finally {
      setSessionsLoading(false);
    }
  }, [user, status, locale]);

  useLayoutEffect(() => {
    if (status === "loading" || !user) return;
    setSessionsLoading(true);
  }, [user, status]);

  useEffect(() => {
    reloadSessions();
  }, [reloadSessions]);

  return (
    <SessionsContext.Provider
      value={{ sessions, setSessions, sessionsLoading, reloadSessions }}
    >
      {children}
    </SessionsContext.Provider>
  );
};

export function useSessions() {
  const ctx = useContext(SessionsContext);
  if (!ctx) {
    throw new Error("useSessions must be used within SessionsProvider");
  }
  return ctx;
}

export default SessionsProvider;
