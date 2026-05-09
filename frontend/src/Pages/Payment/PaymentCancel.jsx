import { Link } from "react-router-dom";
import "../Auth/AuthPages.css";
import "./PaymentPages.css";

export default function PaymentCancel() {
  return (
    <div className="payment-page auth-page">
      <div className="payment-card auth-card">
        <h1 className="payment-page__title auth-page__title">Pago cancelado</h1>
        <p className="payment-page__subtitle auth-page__subtitle">
          No se ha completado el pago y no se ha realizado ningun cargo. Puedes volver al
          curso cuando quieras e intentarlo de nuevo.
        </p>
        <p className="payment-page__status">Tu acceso permanece sin cambios.</p>

        <div className="payment-page__actions">
          <Link className="payment-page__button" to="/course">
            Volver al curso
          </Link>
          <Link className="payment-page__button payment-page__button--secondary" to="/account">
            Ir a mi cuenta
          </Link>
        </div>
      </div>
    </div>
  );
}
