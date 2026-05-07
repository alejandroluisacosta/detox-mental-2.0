import {
  useCallback,
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
  
  const reloadSessions = useCallback(async () => {
    if (status === "loading") return;

    if (!user) {
      setSessions(sessionsData);
      setSessionsLoading(false);
      return;
    }

    try {
      const res = await apiFetch("/auth/me/unblocked-sessions");
      if (!res.ok) throw new Error("unblocked fetch failed");
      const data = await res.json();
      const ids = Array.isArray(data.sessionIds) ? data.sessionIds : [];
      setSessions(mergeUnlockedSessions(ids));
    } catch (e) {
      console.error("[sessions]", e);
      setSessions(sessionsData);
    } finally {
      setSessionsLoading(false);
    }
  }, [user, status]);

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
