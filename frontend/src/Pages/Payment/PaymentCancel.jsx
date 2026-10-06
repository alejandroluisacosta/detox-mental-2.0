import { Link } from "react-router-dom";
import { useLocale } from "../../Context/LocaleContext.jsx";
import "../Auth/AuthPages.css";
import "./PaymentPages.css";

export default function PaymentCancel() {
  const { t } = useLocale();

  return (
    <div className="payment-page auth-page">
      <div className="payment-card auth-card">
        <h1 className="payment-page__title auth-page__title">{t('payment.cancelTitle')}</h1>
        <p className="payment-page__subtitle auth-page__subtitle">
          {t('payment.cancelSubtitle')}
        </p>
        <p className="payment-page__status">{t('payment.cancelStatus')}</p>

        <div className="payment-page__actions">
          <Link className="payment-page__button" to="/course">
            {t('payment.backToCourse')}
          </Link>
          <Link className="payment-page__button payment-page__button--secondary" to="/account">
            {t('payment.goToAccount')}
          </Link>
        </div>
      </div>
    </div>
  );
}
