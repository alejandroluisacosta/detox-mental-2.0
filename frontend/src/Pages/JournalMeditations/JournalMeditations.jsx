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

const JournalMeditations = () => {
  const { user, status } = useAuth();
  const { demoMode } = useDemoMode();
  const { locale, t } = useLocale();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [entryPendingDelete, setEntryPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
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
      setEntryPendingDelete(null);
      return undefined;
    }

    if (status !== 'ready' || !user) {
      setEntries([]);
      setLoading(false);
      setEntryPendingDelete(null);
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
        throw new Error(data.message || t('meditations.deleteFailed'));
      }

      setEntries((prev) => prev.filter((entry) => entry.id !== entryId));
      setEntryPendingDelete(null);
      emitToast(t('meditations.deleteSuccess'));
    } catch (err) {
      console.error('[journal meditations DELETE]', err);
      setEntryPendingDelete(null);
      emitToast(err.message || t('meditations.deleteFailed'));
    } finally {
      setDeleting(false);
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
              const deleteDisabled = deleting && entryPendingDelete?.id === entry.id;

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
                        onClick={() => setEntryPendingDelete(entry)}
                        disabled={deleteDisabled}
                        aria-label={t('meditations.deleteEntry')}
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

      {entryPendingDelete && (
        <JournalConfirmModal
          labelledById="journal-meditations-delete-modal-title"
          title={t('meditations.deleteTitle')}
          text={t('meditations.deleteText')}
          onClose={closeDeleteModal}
          primary={{
            label: deleting ? t('meditations.deleting') : t('meditations.delete'),
            onClick: confirmDeleteEntry,
            disabled: deleting,
          }}
          secondary={{
            label: t('meditations.cancel'),
            onClick: closeDeleteModal,
            disabled: deleting,
          }}
        />
      )}
    </div>
  );
};

export default JournalMeditations;
