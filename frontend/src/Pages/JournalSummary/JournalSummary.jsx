import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DemoModeToggle from '../../Components/DemoModeToggle/DemoModeToggle.jsx';
import Navigation from '../../Components/Navigation/Navigation.jsx';
import { useAuth } from '../../Context/AuthContext.jsx';
import { useDemoMode } from '../../Context/DemoModeContext.jsx';
import { apiFetch } from '../../api/client.js';
import { DEMO_SUMMARY_PAYLOAD } from '../../data/demoJournal.js';
import { emitToast } from '../../lib/toastBus.js';
import JournalSummaryLoadingScreen from '../../Components/JournalSummaryLoadingScreen/JournalSummaryLoadingScreen.jsx';
import './JournalSummary.css';

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
  const { demoMode } = useDemoMode();
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateReady, setGenerateReady] = useState(false);
  const [pendingSummary, setPendingSummary] = useState(null);

  const loadCurrent = useCallback(async () => {
    if (demoMode) {
      setPayload(null);
      setLoading(false);
      return;
    }

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
  }, [demoMode, status, user]);

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

  const effectivePayload = demoMode ? DEMO_SUMMARY_PAYLOAD : payload;
  const summary = effectivePayload?.summary;
  const weekLabel = formatWeekLabel(
    effectivePayload?.weekStart,
    effectivePayload?.weekEnd,
  );

  return (
    <div className="journal-page journal-page--summary">
      <Navigation />
      <main className="journal-page__main journal-summary__main">
        <header className="journal-summary__header journal-summary__header--with-actions">
          <div className="journal-summary__header-top">
            <h1 className="journal-summary__title">Resumen semanal</h1>
            <DemoModeToggle />
          </div>
          <div className="journal-summary__header-actions">
            <Link
              to="/journal"
              className="journal-summary__write-button journal-summary__write-button--header"
            >
              Escribir
            </Link>
            <Link
              to="/journal/history"
              className="journal-summary__write-button journal-summary__write-button--header journal-summary__write-button--secondary"
            >
              Historial
            </Link>
          </div>
        </header>

        {weekLabel && (
          <p className="journal-summary__week">{weekLabel}</p>
        )}

        {!demoMode && status === 'loading' && (
          <p className="journal-summary__status">Cargando…</p>
        )}

        {!demoMode && status === 'ready' && !user && (
          <div className="journal-summary__empty">
            <p>Inicia sesión para ver o crear tu resumen semanal.</p>
            <Link to="/login" className="journal-summary__action-link">
              Iniciar sesión
            </Link>
          </div>
        )}

        {!demoMode && status === 'ready' && user && loading && (
          <p className="journal-summary__status">Cargando resumen…</p>
        )}

        {(demoMode || (status === 'ready' && user && !loading && summary)) && (
          <div className="journal-summary__result">
            <section className="journal-summary__section">
              <h2 className="journal-summary__heading">Esta semana</h2>
              {Array.isArray(summary.mainTopics) &&
                summary.mainTopics.length > 0 && (
                  <ul
                    className="journal-summary__topics"
                    aria-label="Temas principales"
                  >
                    {summary.mainTopics.map((topic) => (
                      <li key={topic} className="journal-summary__topic-chip">
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

            {summary.machiavelliText && (
              <section className="journal-summary__section">
                <h2 className="journal-summary__heading journal-summary__heading--machiavelli">
                  <img
                    src="/images/machiavelli.webp"
                    alt="Machiavelli"
                    className="journal-summary__avatar"
                  />
                  Desafío Machiavélico
                </h2>
                <p className="journal-summary__machiavelli">
                  {summary.machiavelliText}
                </p>
              </section>
            )}
          </div>
        )}

        {!demoMode && status === 'ready' && user && !loading && !summary && (
          <div className="journal-summary__create">
            {effectivePayload?.canCreate ? (
              <>
                <p className="journal-summary__lead">
                  Ya puedes crear el resumen de esta semana a partir de tus
                  escrituras.
                </p>
                <button
                  type="button"
                  className="journal-summary__complete-button"
                  onClick={handleCreate}
                >
                  CREAR RESUMEN
                </button>
              </>
            ) : (
              <div className="journal-summary__empty">
                {(effectivePayload?.entryCount ?? 0) < (effectivePayload?.minEntries ?? 2) ? (
                  <>
                    <p>
                      Necesitas al menos {effectivePayload?.minEntries ?? 2} entradas
                      esta semana para crear el resumen. Llevas{' '}
                      {effectivePayload?.entryCount ?? 0}.
                    </p>
                    <Link to="/journal" className="journal-summary__action-link">
                      Escribir
                    </Link>
                  </>
                ) : effectivePayload?.window?.enforced && !effectivePayload?.window?.open ? (
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
          <Link to="/journal/history" className="journal-summary__history-link">
            Ver historial
          </Link>
        </div>
      </main>
    </div>
  );
};

export default JournalSummary;
