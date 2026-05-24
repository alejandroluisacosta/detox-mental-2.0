import { useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../api/client.js";
import "./AuthPages.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError("Introduce un email válido.");
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
        setError(data.message || "Revisa el email e inténtalo de nuevo.");
      } else {
        setError("No se pudo enviar el enlace. Inténtalo más tarde.");
      }
    } catch {
      setError("No se pudo enviar el enlace. Inténtalo más tarde.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-page__title">Iniciar sesión</h1>
        <p className="auth-page__subtitle">
          Te enviaremos un enlace seguro a tu correo. Válido 15 minutos y de un
          solo uso.
        </p>

        {success ? (
          <>
            <p className="auth-page__message auth-page__message--success">
              Si existe un usuario con ese email, se ha enviado un enlace de
              login. Revisa tu bandeja de entrada.
            </p>
            <Link className="auth-page__footer-link" to="/">
              Ir a la teoría
            </Link>
            <Link className="auth-page__footer-link" to="/course">
              Ir al curso
            </Link>
          </>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <label className="auth-form__label" htmlFor="login-email">
              Email
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
              {loading ? "Enviando…" : "Enviar enlace"}
            </button>
            <Link className="auth-page__footer-link" to="/">
              Ir a la teoría
            </Link>
            <Link className="auth-page__footer-link" to="/course">
              Ir al curso
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
