import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../../Components/Navigation/Navigation.jsx';
import CloseIcon from '../../Components/CloseIcon/CloseIcon.jsx';
import DemoModeToggle from '../../Components/DemoModeToggle/DemoModeToggle.jsx';
import { useAuth } from '../../Context/AuthContext.jsx';
import { useDemoMode } from '../../Context/DemoModeContext.jsx';
import { apiFetch } from '../../api/client.js';
import { DEMO_ENTRIES } from '../../data/demoJournal.js';
import { emitToast } from '../../lib/toastBus.js';
import JournalSummaryBanner from '../../Components/JournalSummaryBanner/JournalSummaryBanner.jsx';
import '../Journal/Journal.css';

const EXCERPT_WORD_COUNT = 40;

const formatEntryDate = (iso) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Fecha desconocida';
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

const getWordCount = (content) =>
  String(content).trim().split(/\s+/).filter(Boolean).length;

const getExcerpt = (content) => {
  const words = String(content).trim().split(/\s+/).filter(Boolean);
  if (words.length <= EXCERPT_WORD_COUNT) return words.join(' ');
  return `${words.slice(0, EXCERPT_WORD_COUNT).join(' ')}…`;
};

const JournalHistory = () => {
  const { user, status } = useAuth();
  const { demoMode } = useDemoMode();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const [entryPendingDelete, setEntryPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const visibleEntries = demoMode ? DEMO_ENTRIES : entries;

  useEffect(() => {
    if (demoMode) {
      setEntries([]);
      setExpandedIds(new Set());
      setLoading(false);
      setEntryPendingDelete(null);
      return undefined;
    }

    if (status !== 'ready' || !user) {
      setEntries([]);
      setExpandedIds(new Set());
      setLoading(false);
      setEntryPendingDelete(null);
      return undefined;
    }

    let cancelled = false;

    const loadEntries = async () => {
      setLoading(true);
      try {
        const res = await apiFetch('/auth/me/journal-entries');
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || 'No se pudo cargar el diario.');
        }
        const data = await res.json();
        if (!cancelled) {
          setEntries(Array.isArray(data.entries) ? data.entries : []);
          setExpandedIds(new Set());
        }
      } catch (err) {
        console.error('[journal GET]', err);
        if (!cancelled) {
          setEntries([]);
          setExpandedIds(new Set());
          emitToast(err.message || 'No se pudo cargar el diario.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadEntries();
    return () => {
      cancelled = true;
    };
  }, [demoMode, status, user]);

  const toggleExpanded = (entryId) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(entryId)) next.delete(entryId);
      else next.add(entryId);
      return next;
    });
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setEntryPendingDelete(null);
  };

  const confirmDeleteEntry = async () => {
    if (!entryPendingDelete || deleting) return;

    const entryId = entryPendingDelete.id;
    setDeleting(true);
    try {
      const res = await apiFetch(`/auth/me/journal-entries/${entryId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'No se pudo eliminar la entrada.');
      }

      setEntries((prev) => prev.filter((entry) => entry.id !== entryId));
      setExpandedIds((prev) => {
        if (!prev.has(entryId)) return prev;
        const next = new Set(prev);
        next.delete(entryId);
        return next;
      });
      setEntryPendingDelete(null);
      emitToast('Entrada eliminada.');
    } catch (err) {
      console.error('[journal DELETE]', err);
      setEntryPendingDelete(null);
      emitToast(err.message || 'No se pudo eliminar la entrada.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="journal-page journal-page--history">
      <Navigation />
      <main className="journal-page__main journal-page__main--history">
        <header className="journal-history__header journal-history__header--with-actions">
          <div className="journal-history__header-top">
            <h1 className="journal-history__title">Historial</h1>
            <DemoModeToggle />
          </div>
          <div className="journal-history__header-actions">
            <Link
              to="/journal"
              className="journal-history__write-button journal-history__write-button--header"
            >
              Escribir
            </Link>
            <Link
              to="/journal/summary"
              className="journal-history__write-button journal-history__write-button--header journal-history__write-button--secondary"
            >
              Resumen
            </Link>
          </div>
        </header>

        {!demoMode && <JournalSummaryBanner />}

        {!demoMode && status === 'loading' && (
          <p className="journal-history__status">Cargando…</p>
        )}

        {!demoMode && status === 'ready' && !user && (
          <div className="journal-history__empty">
            <p>Inicia sesión para ver las entradas guardadas en tu diario.</p>
            <Link to="/login" className="journal-history__action-link">
              Iniciar sesión
            </Link>
          </div>
        )}

        {!demoMode && status === 'ready' && user && loading && (
          <p className="journal-history__status">Cargando entradas…</p>
        )}

        {!demoMode && status === 'ready' && user && !loading && visibleEntries.length === 0 && (
          <div className="journal-history__empty">
            <p>Aún no hay entradas en tu diario.</p>
            <Link to="/journal" className="journal-history__action-link">
              Escribir la primera
            </Link>
          </div>
        )}

        {(demoMode || (status === 'ready' && user && !loading && visibleEntries.length > 0)) && (
          <ul className="journal-history__feed">
            {visibleEntries.map((entry) => {
              const expandable = getWordCount(entry.content) > EXCERPT_WORD_COUNT;
              const expanded = expandedIds.has(entry.id);
              const bodyText =
                expandable && !expanded
                  ? getExcerpt(entry.content)
                  : entry.content;
              const deleteDisabled =
                deleting && entryPendingDelete?.id === entry.id;

              return (
                <li key={entry.id} className="journal-history__card">
                  <div className="journal-history__card-top">
                    <time
                      className="journal-history__date"
                      dateTime={entry.createdAt}
                    >
                      {formatEntryDate(entry.createdAt)}
                    </time>
                    {!demoMode && (
                      <button
                        type="button"
                        className="journal-history__delete"
                        onClick={() => setEntryPendingDelete(entry)}
                        disabled={deleteDisabled}
                        aria-label="Eliminar entrada"
                      >
                        <img
                          src="/icons/trash.svg"
                          alt=""
                          className="journal-history__delete-icon"
                          aria-hidden="true"
                        />
                      </button>
                    )}
                  </div>
                  {Array.isArray(entry.topics) && entry.topics.length > 0 && (
                    <ul
                      className="journal-history__topics"
                      aria-label="Temas"
                    >
                      {entry.topics.map((topic) => (
                        <li key={topic} className="journal-history__topic-chip">
                          {topic}
                        </li>
                      ))}
                    </ul>
                  )}
                  {expandable ? (
                    <p
                      className="journal-history__excerpt journal-history__excerpt--toggleable"
                      onClick={() => toggleExpanded(entry.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleExpanded(entry.id);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-expanded={expanded}
                    >
                      {bodyText}
                    </p>
                  ) : (
                    <p className="journal-history__excerpt">{bodyText}</p>
                  )}
                  {expandable && (
                    <button
                      type="button"
                      className="journal-history__toggle"
                      onClick={() => toggleExpanded(entry.id)}
                      aria-expanded={expanded}
                    >
                      {expanded ? 'Mostrar menos' : 'Mostrar más'}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {(demoMode || status !== 'loading') && (
          <Link
            to="/journal"
            className="journal-history__write-button journal-history__write-button--footer"
          >
            ESCRIBIR
          </Link>
        )}
      </main>

      {entryPendingDelete && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDeleteModal();
          }}
        >
          <div
            className="journal-guest-modal modal-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="journal-delete-modal-title"
          >
            <CloseIcon handleCloseModal={closeDeleteModal} />
            <h2
              id="journal-delete-modal-title"
              className="journal-guest-modal__title"
            >
              ¿Eliminar esta entrada?
            </h2>
            <p className="journal-guest-modal__text">
              Esta acción no se puede deshacer. La entrada se borrará de tu
              diario de forma permanente.
            </p>
            <button
              type="button"
              className="journal-guest-modal__button"
              onClick={confirmDeleteEntry}
              disabled={deleting}
            >
              {deleting ? 'ELIMINANDO...' : 'ELIMINAR'}
            </button>
            <button
              type="button"
              className="journal-guest-modal__button journal-guest-modal__button--secondary"
              onClick={closeDeleteModal}
              disabled={deleting}
            >
              CANCELAR
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalHistory;
