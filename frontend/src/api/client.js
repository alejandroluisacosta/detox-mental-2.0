/**
 * API base URL for the Detox Mental backend (auth, future REST).
 * Must match CORS FRONTEND_ORIGIN + credentials cookies.
 */
import { readStoredLocale } from "../utils/locale.js";

export const getApiBase = () => {
  return import.meta.env.VITE_API_URL || "http://localhost:3000";
};

/**
 * fetch() to our API with cookies (JWT HttpOnly cookie).
 * Pass JSON-serializable `body` for POST/PATCH; omit for GET.
 */
export const apiFetch = (path, options = {}) => {
  const base = String(getApiBase()).replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  const url = `${base}${p}`;
  const { body, headers = {}, ...rest } = options;
  let finalBody = body;
  const hdrs = { ...headers };
  if (!hdrs["Accept-Language"] && !hdrs["accept-language"]) {
    hdrs["Accept-Language"] = readStoredLocale();
  }
  if (body != null && typeof body !== "string" && !(body instanceof FormData)) {
    finalBody = JSON.stringify(body);
    hdrs["Content-Type"] = "application/json";
  }
  return fetch(url, {
    credentials: "include",
    ...rest,
    headers: hdrs,
    body: finalBody,
  });
};
