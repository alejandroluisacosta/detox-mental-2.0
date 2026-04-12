import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext.jsx";
import { subscribeToast } from "../../lib/toastBus.js";
import "./AuthSessionToast.css";

/**
 * Set to `true` to keep a sample toast visible (no auto-dismiss) for layout/CSS tweaks.
 * Set back to `false` for normal login/logout toasts with timed fade in/out.
 */
const DEBUG_TOAST_PINNED = false;

const FADE_IN_MS = 750;
const HOLD_MS = 1250;
const FADE_OUT_MS = 750;

const DEBUG_PLACEHOLDER = (
  <>
    Sesión iniciada como <strong>ejemplo@correo.com</strong>
  </>
);

/** Avoid duplicate toast in React Strict Mode (effects run twice in dev). */
let lastAuthSuccessUrlKey = null;

export default function AuthSessionToast() {
  const [content, setContent] = useState(
    DEBUG_TOAST_PINNED ? DEBUG_PLACEHOLDER : null,
  );
  const [visible, setVisible] = useState(DEBUG_TOAST_PINNED);
  const timersRef = useRef([]);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, status } = useAuth();

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const showToast = useCallback((next) => {
    if (next == null || next === "") return;
    clearTimers();
    setContent(next);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    if (DEBUG_TOAST_PINNED) return;
    const t1 = setTimeout(() => setVisible(false), FADE_IN_MS + HOLD_MS);
    const t2 = setTimeout(() => {
      setContent(null);
    }, FADE_IN_MS + HOLD_MS + FADE_OUT_MS);
    timersRef.current = [t1, t2];
  }, []);

  useEffect(() => () => clearTimers(), []);

  useEffect(() => {
    return subscribeToast(showToast);
  }, [showToast]);

  useEffect(() => {
    if (DEBUG_TOAST_PINNED) return;
    if (searchParams.get("auth") !== "success") {
      lastAuthSuccessUrlKey = null;
      return;
    }
    if (status !== "ready" || !user?.email) return;

    const urlKey = `${location.pathname}?${searchParams.toString()}`;
    if (urlKey === lastAuthSuccessUrlKey) return;
    lastAuthSuccessUrlKey = urlKey;

    showToast(
      <>
        Sesión iniciada como <strong>{user.email}</strong>
      </>,
    );
    const next = new URLSearchParams(searchParams);
    next.delete("auth");
    const search = next.toString();
    navigate(
      { pathname: location.pathname, search: search ? `?${search}` : "" },
      { replace: true },
    );
  }, [searchParams, location.pathname, user, status, navigate, showToast]);

  if (content == null) return null;

  return (
    <div
      className={`auth-session-toast ${visible ? "auth-session-toast--visible" : ""}`}
      role="status"
      aria-live="polite"
    >
      {content}
    </div>
  );
}
