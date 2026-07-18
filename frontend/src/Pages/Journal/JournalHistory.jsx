import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../../Components/Navigation/Navigation.jsx';
import { useAuth } from '../../Context/AuthContext.jsx';
import { apiFetch } from '../../api/client.js';
import { emitToast } from '../../lib/toastBus.js';
import './Journal.css';

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
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedIds, setExpandedIds] = useState(() => new Set());

  useEffect(() => {
    if (status !== 'ready' || !user) {
      setEntries([]);
      setExpandedIds(new Set());
      setLoading(false);
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
  }, [status, user]);

  const toggleExpanded = (entryId) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(entryId)) next.delete(entryId);
      else next.add(entryId);
      return next;
    });
  };

  return (
    <div className="journal-page journal-page--history">
      <Navigation />
      <main className="journal-page__main journal-page__main--history">
        <header className="journal-history__header">
          <h1 className="journal-history__title">Historial</h1>
          <Link to="/journal" className="journal-history__back-link">
            Escribir
          </Link>
        </header>

        {status === 'loading' && (
          <p className="journal-history__status">Cargando…</p>
        )}

        {status === 'ready' && !user && (
          <div className="journal-history__empty">
            <p>Inicia sesión para ver las entradas guardadas en tu diario.</p>
            <Link to="/login" className="journal-history__action-link">
              Iniciar sesión
            </Link>
          </div>
        )}

        {status === 'ready' && user && loading && (
          <p className="journal-history__status">Cargando entradas…</p>
        )}

        {status === 'ready' && user && !loading && entries.length === 0 && (
          <div className="journal-history__empty">
            <p>Aún no hay entradas en tu diario.</p>
            <Link to="/journal" className="journal-history__action-link">
              Escribir la primera
            </Link>
          </div>
        )}

        {status === 'ready' && user && !loading && entries.length > 0 && (
          <ul className="journal-history__feed">
            {entries.map((entry) => {
              const expandable = getWordCount(entry.content) > EXCERPT_WORD_COUNT;
              const expanded = expandedIds.has(entry.id);
              const bodyText =
                expandable && !expanded
                  ? getExcerpt(entry.content)
                  : entry.content;

              return (
                <li key={entry.id} className="journal-history__card">
                  <time
                    className="journal-history__date"
                    dateTime={entry.createdAt}
                  >
                    {formatEntryDate(entry.createdAt)}
                  </time>
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
      </main>
    </div>
  );
};

export default JournalHistory;
