import { Link, useSearchParams } from "react-router-dom";
import "./AuthPages.css";

const REASON_COPY = {
  invalid_token:
    "El enlace no es válido o está incompleto. Solicita un nuevo enlace desde la página de inicio de sesión.",
  invalid_or_expired_token:
    "Este enlace ha caducado o ya se ha usado. Solicita un nuevo enlace de inicio de sesión.",
  server_error:
    "Ha ocurrido un error en el servidor. Inténtalo de nuevo en unos minutos.",
};

export default function AuthError() {
  const [searchParams] = useSearchParams();
  const reason = searchParams.get("reason") || "";
  const message =
    REASON_COPY[reason] ||
    "No se ha podido completar el inicio de sesión. Solicita un nuevo enlace.";

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-page__title">No se pudo iniciar sesión</h1>
        <p className="auth-page__subtitle">{message}</p>
        <Link className="auth-page__footer-link" to="/login">
          Solicitar un nuevo enlace
        </Link>
        <Link className="auth-page__footer-link" to="/">
          Ir a la teoría
        </Link>
        <Link className="auth-page__footer-link" to="/course">
          Ir al curso
        </Link>
      </div>
    </div>
  );
}
