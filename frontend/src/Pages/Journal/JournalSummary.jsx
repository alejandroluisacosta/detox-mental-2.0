import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../../Components/Navigation/Navigation.jsx';
import { useAuth } from '../../Context/AuthContext.jsx';
import { apiFetch } from '../../api/client.js';
import { emitToast } from '../../lib/toastBus.js';
import JournalSummaryLoadingScreen from './JournalSummaryLoadingScreen.jsx';
import './Journal.css';

const formatWeekLabel = (weekStart, weekEnd) => {
  if (!weekStart || !weekEnd) return '';
  const start = new Date(`${weekStart}T12:00:00`);
  const end = new Date(`${weekEnd}T12:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return `${weekStart} – ${weekEnd}`;
  }
  const fmt = new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
  });
  return `${fmt.format(start)} – ${fmt.format(end)}`;
};

const JournalSummary = () => {
  const { user, status } = useAuth();
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateReady, setGenerateReady] = useState(false);
  const [pendingSummary, setPendingSummary] = useState(null);

  const loadCurrent = useCallback(async () => {
    if (status !== 'ready' || !user) {
      setPayload(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch('/auth/me/journal-summaries/current');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'No se pudo cargar el resumen.');
      }
      setPayload(data);
    } catch (err) {
      console.error('[journal-summaries GET]', err);
      setPayload(null);
      emitToast(err.message || 'No se pudo cargar el resumen.');
    } finally {
      setLoading(false);
    }
  }, [status, user]);

  useEffect(() => {
    loadCurrent();
  }, [loadCurrent]);

  const handleCreate = async () => {
    if (generating || !payload?.canCreate) return;

    setGenerating(true);
    setGenerateReady(false);
    setPendingSummary(null);

    try {
      const res = await apiFetch('/auth/me/journal-summaries/current', {
        method: 'POST',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'No se pudo crear el resumen.');
      }
      setPendingSummary(data.summary ?? null);
      setGenerateReady(true);
    } catch (err) {
      console.error('[journal-summaries POST]', err);
      setGenerating(false);
      setGenerateReady(false);
      setPendingSummary(null);
      emitToast(err.message || 'No se pudo crear el resumen.');
      // Refresh so canCreate / existing summary stay accurate after a race.
      loadCurrent();
    }
  };

  const finishLoadingScreen = useCallback(() => {
    if (pendingSummary) {
      setPayload((prev) =>
        prev
          ? {
              ...prev,
              summary: pendingSummary,
              canCreate: false,
            }
          : prev,
      );
    }
    setGenerating(false);
    setGenerateReady(false);
    setPendingSummary(null);
  }, [pendingSummary]);

  if (generating) {
    return (
      <div className="journal-page journal-page--summary">
        <Navigation />
        <JournalSummaryLoadingScreen
          ready={generateReady}
          onDone={finishLoadingScreen}
        />
      </div>
    );
  }

  const summary = payload?.summary;
  const weekLabel = formatWeekLabel(payload?.weekStart, payload?.weekEnd);

  return (
    <div className="journal-page journal-page--summary">
      <Navigation />
      <main className="journal-page__main journal-page__main--history">
        <header className="journal-history__header">
          <h1 className="journal-history__title">Resumen semanal</h1>
          <Link
            to="/journal"
            className="journal-history__write-button journal-history__write-button--header"
          >
            Escribir
          </Link>
        </header>

        {weekLabel && (
          <p className="journal-summary__week">{weekLabel}</p>
        )}

        {status === 'loading' && (
          <p className="journal-history__status">Cargando…</p>
        )}

        {status === 'ready' && !user && (
          <div className="journal-history__empty">
            <p>Inicia sesión para ver o crear tu resumen semanal.</p>
            <Link to="/login" className="journal-history__action-link">
              Iniciar sesión
            </Link>
          </div>
        )}

        {status === 'ready' && user && loading && (
          <p className="journal-history__status">Cargando resumen…</p>
        )}

        {status === 'ready' && user && !loading && summary && (
          <div className="journal-summary__result">
            <section className="journal-summary__section">
              <h2 className="journal-summary__heading">Esta semana</h2>
              {Array.isArray(summary.mainTopics) &&
                summary.mainTopics.length > 0 && (
                  <ul
                    className="journal-history__topics"
                    aria-label="Temas principales"
                  >
                    {summary.mainTopics.map((topic) => (
                      <li key={topic} className="journal-history__topic-chip">
                        {topic}
                      </li>
                    ))}
                  </ul>
                )}
              <p className="journal-summary__body">{summary.summaryText}</p>
            </section>

            <section className="journal-summary__section">
              <h2 className="journal-summary__heading">La frase que destacó</h2>
              <blockquote className="journal-summary__quote">
                {summary.bestQuote}
              </blockquote>
            </section>

            <section className="journal-summary__section">
              <h2 className="journal-summary__heading journal-summary__heading--socratic">
                <img
                  src="/images/socrates.webp"
                  alt="Sócrates"
                  className="journal-summary__avatar"
                />
                Pregunta de Sócrates
              </h2>
              <p className="journal-summary__socratic">{summary.socraticText}</p>
            </section>
          </div>
        )}

        {status === 'ready' && user && !loading && !summary && (
          <div className="journal-summary__create">
            {payload?.canCreate ? (
              <>
                <p className="journal-summary__lead">
                  Ya puedes crear el resumen de esta semana a partir de tus
                  escrituras.
                </p>
                <button
                  type="button"
                  className="journal-page__complete-button"
                  onClick={handleCreate}
                >
                  CREAR RESUMEN
                </button>
              </>
            ) : (
              <div className="journal-history__empty">
                {(payload?.entryCount ?? 0) < (payload?.minEntries ?? 2) ? (
                  <>
                    <p>
                      Necesitas al menos {payload?.minEntries ?? 2} entradas
                      esta semana para crear el resumen. Llevas{' '}
                      {payload?.entryCount ?? 0}.
                    </p>
                    <Link to="/journal" className="journal-history__action-link">
                      Escribir
                    </Link>
                  </>
                ) : payload?.window?.enforced && !payload?.window?.open ? (
                  <p>
                    El resumen se puede crear el domingo de 12:00 a 18:00 (hora
                    de Madrid). Mientras tanto, sigue escribiendo.
                  </p>
                ) : (
                  <p>El resumen de esta semana no está disponible ahora.</p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="journal-summary__nav-links">
          <Link to="/journal/history" className="journal-page__history-link">
            Ver historial
          </Link>
        </div>
      </main>
    </div>
  );
};

export default JournalSummary;
