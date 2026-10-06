import { Link } from "react-router-dom";
import { useLocale } from "../../Context/LocaleContext.jsx";
import "../Auth/AuthPages.css";
import "./PaymentPages.css";

export default function PaymentSuccess() {
  const { t } = useLocale();

  return (
    <div className="payment-page auth-page">
      <div className="payment-card auth-card">
        <div className="payment-success__celebration" aria-hidden="true">
          <span className="payment-success__spark payment-success__spark--1" />
          <span className="payment-success__spark payment-success__spark--2" />
          <span className="payment-success__spark payment-success__spark--3" />
          <span className="payment-success__spark payment-success__spark--4" />
          <span className="payment-success__spark payment-success__spark--5" />
        </div>

        <h1 className="payment-page__title auth-page__title">{t('payment.successTitle')}</h1>
        <p className="payment-page__subtitle auth-page__subtitle">
          {t('payment.successSubtitle')}
        </p>
        <p className="payment-page__status">
          {t('payment.successStatus')}
        </p>

        <div className="payment-page__actions">
          <Link className="payment-page__button payment-page__button--course" to="/course">
            {t('payment.goToCourse')}
          </Link>
        </div>
        <p className="payment-page__hint">{t('payment.receiptHint')}</p>
      </div>
    </div>
  );
}
