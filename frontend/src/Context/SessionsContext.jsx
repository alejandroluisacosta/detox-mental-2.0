import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { sessionsData } from "../data";
import { mergeUnlockedSessions } from "../utils/mergeUnlockedSessions.js";
import { apiFetch } from "../api/client.js";
import { useAuth } from "./AuthContext.jsx";

export const SessionsContext = createContext(null);

const SessionsProvider = ({ children }) => {
  const { user, status } = useAuth();
  const [sessions, setSessions] = useState(sessionsData);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  useLayoutEffect(() => {
    if (status === "loading" || !user) return;
    setSessionsLoading(true);
  }, [user, status]);

  useEffect(() => {
    if (status === "loading") return;

    if (!user) {
      setSessions(sessionsData);
      setSessionsLoading(false);
      return;
    }

    let cancelled = false;
    async function loadSessions() {
      try {
        const res = await apiFetch("/auth/me/unblocked-sessions");
        if (!res.ok) throw new Error("unblocked fetch failed");
        const data = await res.json();
        const ids = Array.isArray(data.sessionIds) ? data.sessionIds : [];
        if (cancelled) return;
        setSessions(mergeUnlockedSessions(ids));
      } catch (e) {
        console.error("[sessions]", e);
        if (!cancelled) setSessions(sessionsData);
      } finally {
        if (!cancelled) setSessionsLoading(false);
      }
    }

    loadSessions();

    return () => {
      cancelled = true;
    };
  }, [user, status]);

  return (
    <SessionsContext.Provider
      value={{ sessions, setSessions, sessionsLoading }}
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
