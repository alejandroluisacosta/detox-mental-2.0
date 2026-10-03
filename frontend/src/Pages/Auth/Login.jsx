import { useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../api/client.js";
import { useLocale } from "../../Context/LocaleContext.jsx";
import "./AuthPages.css";

export default function Login() {
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError(t('auth.invalidEmail'));
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        body: { email: trimmed },
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setSuccess(true);
        setEmail("");
      } else if (res.status === 400) {
        setError(data.message || t('auth.checkEmail'));
      } else {
        setError(t('auth.sendFailed'));
      }
    } catch {
      setError(t('auth.sendFailed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-page__title">{t('auth.loginTitle')}</h1>
        <p className="auth-page__subtitle">
          {t('auth.loginSubtitle')}
        </p>

        {success ? (
          <>
            <p className="auth-page__message auth-page__message--success">
              {t('auth.loginSuccess')}
            </p>
            <Link className="auth-page__footer-link" to="/">
              {t('auth.goHome')}
            </Link>
          </>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <label className="auth-form__label" htmlFor="login-email">
              {t('auth.email')}
            </label>
            <input
              id="login-email"
              className="auth-form__input"
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            {error && (
              <p className="auth-page__message auth-page__message--error" role="alert">
                {error}
              </p>
            )}
            <button
              className="auth-form__submit"
              type="submit"
              disabled={loading}
            >
              {loading ? t('auth.sending') : t('auth.sendLink')}
            </button>
            <Link className="auth-page__footer-link" to="/">
              {t('auth.goHome')}
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
