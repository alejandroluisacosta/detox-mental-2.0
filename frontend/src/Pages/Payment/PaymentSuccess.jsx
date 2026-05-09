import { Link } from "react-router-dom";
import "../Auth/AuthPages.css";
import "./PaymentPages.css";

export default function PaymentSuccess() {
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

        <h1 className="payment-page__title auth-page__title">Pago completado</h1>
        <p className="payment-page__subtitle auth-page__subtitle">
          Gracias por confiar en Detox Mental. Tu compra se ha procesado correctamente y ya
          tienes acceso al curso completo.
        </p>
        <p className="payment-page__status">
          Si no ves todas las sesiones desbloqueadas al instante cuando vuelvas al curso, por
          favor recarga la página.
        </p>

        <div className="payment-page__actions">
          <Link className="payment-page__button payment-page__button--course" to="/course">
            Ir al curso
          </Link>
        </div>
        <p className="payment-page__hint">Te enviaremos recibo desde Stripe a tu correo.</p>
      </div>
    </div>
  );
}
