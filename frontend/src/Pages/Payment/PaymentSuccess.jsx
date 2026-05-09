import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext.jsx";
import { useSessions } from "../../Context/SessionsContext.jsx";
import "../Auth/AuthPages.css";
import "./PaymentPages.css";

export default function PaymentSuccess() {
  const { refreshUser } = useAuth();
  const { reloadSessions } = useSessions();
  const hasAutoSyncedRef = useRef(false);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);

  const syncAccess = useCallback(async () => {
    setSyncError(null);
    setSyncing(true);
    try {
      await Promise.all([refreshUser(), reloadSessions()]);
    } catch (err) {
      console.error("[payment-success]", err);
      setSyncError("No se pudo actualizar el acceso. Recarga la página en unos segundos.");
    } finally {
      setSyncing(false);
    }
  }, [refreshUser, reloadSessions]);

  useEffect(() => {
    if (hasAutoSyncedRef.current) return;
    hasAutoSyncedRef.current = true;
    syncAccess();
  }, [syncAccess]);

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
          Si no ves todas las sesiones desbloqueadas al instante, pulsa actualizar o recarga
          en unos segundos.
        </p>

        <div className="payment-page__actions">
          <Link className="payment-page__button" to="/course">
            Ir al curso
          </Link>
          <Link className="payment-page__button payment-page__button--secondary" to="/account">
            Ir a mi cuenta
          </Link>
          <button
            type="button"
            className="payment-page__button payment-page__button--ghost"
            onClick={syncAccess}
            disabled={syncing}
          >
            {syncing ? "Actualizando..." : "Actualizar desbloqueos"}
          </button>
        </div>

        {syncError ? (
          <p className="payment-page__hint payment-page__hint--error">{syncError}</p>
        ) : (
          <p className="payment-page__hint">Te enviaremos recibo desde Stripe a tu correo.</p>
        )}
      </div>
    </div>
  );
}
