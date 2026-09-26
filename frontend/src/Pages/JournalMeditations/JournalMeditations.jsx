import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../../Components/Navigation/Navigation.jsx';
import DemoModeToggle from '../../Components/DemoModeToggle/DemoModeToggle.jsx';
import JournalConfirmModal from '../../Components/JournalConfirmModal/JournalConfirmModal.jsx';
import LoadingStatus from '../../Components/LoadingStatus/LoadingStatus.jsx';
import { useAuth } from '../../Context/AuthContext.jsx';
import { useDemoMode } from '../../Context/DemoModeContext.jsx';
import { useLocale } from '../../Context/LocaleContext.jsx';
import { apiFetch } from '../../api/client.js';
import { getDemoEntries } from '../../data/demoJournal.js';
import { emitToast } from '../../lib/toastBus.js';
import { formatLocaleDate } from '../../utils/locale.js';
import { formatPagesRemaining, pagesRemaining } from '../../utils/meditationPages.js';
import './JournalMeditations.css';

const MEDITATIONS_TOPIC = 'meditations';

const formatEntryDate = (iso, locale, unknownLabel) => {
  const formatted = formatLocaleDate(iso, locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return formatted || unknownLabel;
};

const filterMeditationEntries = (entries) =>
  entries
    .filter((entry) => Array.isArray(entry.topics) && entry.topics.includes(MEDITATIONS_TOPIC))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

const topicsWithoutMeditations = (topics) =>
  (Array.isArray(topics) ? topics : []).filter((topic) => topic !== MEDITATIONS_TOPIC);

const JournalMeditations = () => {
  const { user, status } = useAuth();
  const { demoMode } = useDemoMode();
  const { locale, t } = useLocale();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [entryPendingRemove, setEntryPendingRemove] = useState(null);
  const [removing, setRemoving] = useState(false);
  const demoEntries = useMemo(
    () => (demoMode ? filterMeditationEntries(getDemoEntries(locale)) : []),
    [demoMode, locale],
  );
  const visibleEntries = demoMode ? demoEntries : entries;
  const showPagesLeft = demoMode || (status === 'ready' && user && !loading);
  const pagesLeftLabel = useMemo(() => {
    const pages = pagesRemaining(visibleEntries);
    const formatted = formatPagesRemaining(pages, locale);
    return t('meditations.pagesLeft', { pages: formatted });
  }, [locale, t, visibleEntries]);

  useEffect(() => {
    if (demoMode) {
      setEntries([]);
      setLoading(false);
      setEntryPendingRemove(null);
      return undefined;
    }

    if (status !== 'ready' || !user) {
      setEntries([]);
      setLoading(false);
      setEntryPendingRemove(null);
      return undefined;
    }

    let cancelled = false;

    const loadEntries = async () => {
      setLoading(true);
      try {
        const res = await apiFetch('/auth/me/journal-entries?topic=meditations');
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || t('meditations.loadFailed'));
        }
        const data = await res.json();
        if (!cancelled) {
          setEntries(Array.isArray(data.entries) ? data.entries : []);
        }
      } catch (err) {
        console.error('[journal meditations GET]', err);
        if (!cancelled) {
          setEntries([]);
          emitToast(err.message || t('meditations.loadFailed'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadEntries();
    return () => {
      cancelled = true;
    };
  }, [demoMode, status, t, user]);

  const closeRemoveModal = () => {
    if (removing) return;
    setEntryPendingRemove(null);
  };

  const confirmRemoveFromMeditations = async () => {
    if (!entryPendingRemove || removing) return;

    const entryId = entryPendingRemove.id;
    const topics = topicsWithoutMeditations(entryPendingRemove.topics);
    setRemoving(true);
    try {
      const res = await apiFetch(`/auth/me/journal-entries/${entryId}`, {
        method: 'PATCH',
        body: { topics },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || t('meditations.removeFailed'));
      }

      setEntries((prev) => prev.filter((entry) => entry.id !== entryId));
      setEntryPendingRemove(null);
      emitToast(t('meditations.removeSuccess'));
    } catch (err) {
      console.error('[journal meditations PATCH]', err);
      setEntryPendingRemove(null);
      emitToast(err.message || t('meditations.removeFailed'));
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="journal-page journal-page--meditations">
      <Navigation />
      <main className="journal-page__main journal-page__main--meditations">
        <header className="journal-meditations__header">
          <div className="journal-meditations__header-top">
            <h1 className="journal-meditations__title">{t('meditations.title')}</h1>
            <DemoModeToggle />
          </div>
          {showPagesLeft && (
            <div className="journal-meditations__pages-left">
              <img
                src="/icons/book.svg"
                alt=""
                aria-hidden="true"
                className="journal-meditations__book-icon"
              />
              <span className="journal-meditations__pages-left-text">{pagesLeftLabel}</span>
            </div>
          )}
          <div className="journal-meditations__header-actions">
            <Link
              to="/journal"
              className="journal-meditations__write-button journal-meditations__write-button--header"
            >
              {t('meditations.write')}
            </Link>
            <Link
              to="/journal/history"
              className="journal-meditations__write-button journal-meditations__write-button--header journal-meditations__write-button--secondary"
            >
              {t('meditations.history')}
            </Link>
          </div>
        </header>

        {!demoMode && status === 'loading' && (
          <LoadingStatus>{t('meditations.loading')}</LoadingStatus>
        )}

        {!demoMode && status === 'ready' && !user && (
          <div className="journal-meditations__empty">
            <p>{t('meditations.guestEmpty')}</p>
            <Link to="/login" className="journal-meditations__action-link">
              {t('meditations.login')}
            </Link>
          </div>
        )}

        {!demoMode && status === 'ready' && user && loading && (
          <LoadingStatus>{t('meditations.loadingEntries')}</LoadingStatus>
        )}

        {!demoMode && status === 'ready' && user && !loading && visibleEntries.length === 0 && (
          <div className="journal-meditations__empty">
            <p>{t('meditations.noEntries')}</p>
            <Link to="/journal/history" className="journal-meditations__action-link">
              {t('meditations.goToHistory')}
            </Link>
          </div>
        )}

        {(demoMode || (status === 'ready' && user && !loading && visibleEntries.length > 0)) && (
          <article className="journal-meditations__compilation">
            {visibleEntries.map((entry) => {
              const removeDisabled = removing && entryPendingRemove?.id === entry.id;

              return (
                <section key={entry.id} className="journal-meditations__section">
                  <div className="journal-meditations__date-row">
                    <h2 className="journal-meditations__date">
                      <time dateTime={entry.createdAt}>
                        {formatEntryDate(entry.createdAt, locale, t('meditations.unknownDate'))}
                      </time>
                    </h2>
                    {!demoMode && status === 'ready' && user && (
                      <button
                        type="button"
                        className="journal-meditations__delete"
                        onClick={() => setEntryPendingRemove(entry)}
                        disabled={removeDisabled}
                        aria-label={t('meditations.removeFromMeditations')}
                      >
                        <img
                          src="/icons/trash.svg"
                          alt=""
                          className="journal-meditations__delete-icon"
                          aria-hidden="true"
                        />
                      </button>
                    )}
                  </div>
                  <p className="journal-meditations__text">{entry.content}</p>
                </section>
              );
            })}
          </article>
        )}

        {(demoMode || status !== 'loading') && (
          <Link
            to="/journal"
            className="journal-meditations__write-button journal-meditations__write-button--footer"
          >
            {t('meditations.writeFooter')}
          </Link>
        )}
      </main>

      {entryPendingRemove && (
        <JournalConfirmModal
          labelledById="journal-meditations-remove-modal-title"
          title={t('meditations.removeTitle')}
          text={t('meditations.removeText')}
          onClose={closeRemoveModal}
          primary={{
            label: t('meditations.removeConfirm'),
            onClick: confirmRemoveFromMeditations,
            disabled: removing,
          }}
          secondary={{
            label: t('meditations.removeCancel'),
            onClick: closeRemoveModal,
            disabled: removing,
          }}
        />
      )}
    </div>
  );
};

export default JournalMeditations;
