import { Link, useSearchParams } from "react-router-dom";
import { useLocale } from "../../Context/LocaleContext.jsx";
import "./AuthPages.css";

const REASON_KEYS = {
  invalid_token: 'auth.errorInvalidToken',
  invalid_or_expired_token: 'auth.errorExpiredToken',
  server_error: 'auth.errorServer',
};

export default function AuthError() {
  const [searchParams] = useSearchParams();
  const { t } = useLocale();
  const reason = searchParams.get("reason") || "";
  const message = t(REASON_KEYS[reason] || 'auth.errorFallback');

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-page__title">{t('auth.errorTitle')}</h1>
        <p className="auth-page__subtitle">{message}</p>
        <Link className="auth-page__footer-link" to="/login">
          {t('auth.requestNewLink')}
        </Link>
        <Link className="auth-page__footer-link" to="/">
          {t('auth.goHome')}
        </Link>
      </div>
    </div>
  );
}
