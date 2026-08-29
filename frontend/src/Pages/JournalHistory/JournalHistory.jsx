import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../../Components/Navigation/Navigation.jsx';
import DemoModeToggle from '../../Components/DemoModeToggle/DemoModeToggle.jsx';
import { useAuth } from '../../Context/AuthContext.jsx';
import { useDemoMode } from '../../Context/DemoModeContext.jsx';
import { useLocale } from '../../Context/LocaleContext.jsx';
import { apiFetch } from '../../api/client.js';
import { getDemoEntries } from '../../data/demoJournal.js';
import { emitToast } from '../../lib/toastBus.js';
import { formatLocaleDate } from '../../utils/locale.js';
import JournalSummaryBanner from '../../Components/JournalSummaryBanner/JournalSummaryBanner.jsx';
import JournalConfirmModal from '../../Components/JournalConfirmModal/JournalConfirmModal.jsx';
import JournalTopicsModal from '../../Components/JournalTopicsModal/JournalTopicsModal.jsx';
import LoadingStatus from '../../Components/LoadingStatus/LoadingStatus.jsx';
import './JournalHistory.css';

const EXCERPT_WORD_COUNT = 40;

const formatEntryDate = (iso, locale, unknownLabel) => {
  const formatted = formatLocaleDate(iso, locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return formatted || unknownLabel;
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
  const { locale, t, topicLabel } = useLocale();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const [entryPendingDelete, setEntryPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [entryPendingTopics, setEntryPendingTopics] = useState(null);
  const [savingTopics, setSavingTopics] = useState(false);
  const visibleEntries = demoMode ? getDemoEntries(locale) : entries;

  useEffect(() => {
    if (demoMode) {
      setEntries([]);
      setExpandedIds(new Set());
      setLoading(false);
      setEntryPendingDelete(null);
      setEntryPendingTopics(null);
      return undefined;
    }

    if (status !== 'ready' || !user) {
      setEntries([]);
      setExpandedIds(new Set());
      setLoading(false);
      setEntryPendingDelete(null);
      setEntryPendingTopics(null);
      return undefined;
    }

    let cancelled = false;

    const loadEntries = async () => {
      setLoading(true);
      try {
        const res = await apiFetch('/auth/me/journal-entries');
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || t('history.loadFailed'));
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
          emitToast(err.message || t('history.loadFailed'));
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

  const closeTopicsModal = () => {
    if (savingTopics) return;
    setEntryPendingTopics(null);
  };

  const saveEntryTopics = async (topics) => {
    if (!entryPendingTopics || savingTopics) return;

    const entryId = entryPendingTopics.id;
    setSavingTopics(true);
    try {
      const res = await apiFetch(`/auth/me/journal-entries/${entryId}`, {
        method: 'PATCH',
        body: { topics },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || t('history.topicsUpdateFailed'));
      }
      const data = await res.json().catch(() => ({}));
      setEntries((prev) =>
        prev.map((entry) => {
          if (entry.id !== entryId) return entry;
          if (data.entry && data.entry.id === entryId) return data.entry;
          return { ...entry, topics };
        }),
      );
      setEntryPendingTopics(null);
      emitToast(t('history.topicsUpdateSuccess'));
    } catch (err) {
      console.error('[journal PATCH]', err);
      emitToast(err.message || t('history.topicsUpdateFailed'));
    } finally {
      setSavingTopics(false);
    }
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
        throw new Error(data.message || t('history.deleteFailed'));
      }

      setEntries((prev) => prev.filter((entry) => entry.id !== entryId));
      setExpandedIds((prev) => {
        if (!prev.has(entryId)) return prev;
        const next = new Set(prev);
        next.delete(entryId);
        return next;
      });
      setEntryPendingDelete(null);
      emitToast(t('history.deleteSuccess'));
    } catch (err) {
      console.error('[journal DELETE]', err);
      setEntryPendingDelete(null);
      emitToast(err.message || t('history.deleteFailed'));
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
            <h1 className="journal-history__title">{t('history.title')}</h1>
            <DemoModeToggle />
          </div>
          <div className="journal-history__header-actions">
            <Link
              to="/journal"
              className="journal-history__write-button journal-history__write-button--header"
            >
              {t('history.write')}
            </Link>
            <Link
              to="/journal/summary"
              className="journal-history__write-button journal-history__write-button--header journal-history__write-button--secondary"
            >
              {t('history.summary')}
            </Link>
          </div>
        </header>

        {!demoMode && <JournalSummaryBanner />}

        {!demoMode && status === 'loading' && (
          <LoadingStatus>{t('history.loading')}</LoadingStatus>
        )}

        {!demoMode && status === 'ready' && !user && (
          <div className="journal-history__empty">
            <p>{t('history.guestEmpty')}</p>
            <Link to="/login" className="journal-history__action-link">
              {t('history.login')}
            </Link>
          </div>
        )}

        {!demoMode && status === 'ready' && user && loading && (
          <LoadingStatus>{t('history.loadingEntries')}</LoadingStatus>
        )}

        {!demoMode && status === 'ready' && user && !loading && visibleEntries.length === 0 && (
          <div className="journal-history__empty">
            <p>{t('history.noEntries')}</p>
            <Link to="/journal" className="journal-history__action-link">
              {t('history.writeFirst')}
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
              const topicsEditDisabled =
                savingTopics && entryPendingTopics?.id === entry.id;

              return (
                <li key={entry.id} className="journal-history__card">
                  <div className="journal-history__card-top">
                    <time
                      className="journal-history__date"
                      dateTime={entry.createdAt}
                    >
                      {formatEntryDate(entry.createdAt, locale, t('history.unknownDate'))}
                    </time>
                    {!demoMode && (
                      <div className="journal-history__card-actions">
                        <button
                          type="button"
                          className="journal-history__topics-edit"
                          onClick={() => setEntryPendingTopics(entry)}
                          disabled={topicsEditDisabled}
                          aria-label={t('history.editTopics')}
                        >
                          <img
                            src="/icons/edit.svg"
                            alt=""
                            className="journal-history__topics-edit-icon"
                            aria-hidden="true"
                          />
                        </button>
                        <button
                          type="button"
                          className="journal-history__delete"
                          onClick={() => setEntryPendingDelete(entry)}
                          disabled={deleteDisabled}
                          aria-label={t('history.deleteEntry')}
                        >
                          <img
                            src="/icons/trash.svg"
                            alt=""
                            className="journal-history__delete-icon"
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    )}
                  </div>
                  {Array.isArray(entry.topics) && entry.topics.length > 0 && (
                    <ul
                      className="journal-history__topics"
                      aria-label={t('history.topics')}
                    >
                      {entry.topics.map((topic) => (
                        <li key={topic} className="journal-history__topic-chip">
                          {topicLabel(topic)}
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
                      {expanded ? t('history.showLess') : t('history.showMore')}
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
            {t('history.writeFooter')}
          </Link>
        )}
      </main>

      {entryPendingTopics && (
        <JournalTopicsModal
          key={entryPendingTopics.id}
          initialTopics={entryPendingTopics.topics}
          onClose={closeTopicsModal}
          onSave={saveEntryTopics}
          saving={savingTopics}
        />
      )}

      {entryPendingDelete && (
        <JournalConfirmModal
          labelledById="journal-delete-modal-title"
          title={t('history.deleteTitle')}
          text={t('history.deleteText')}
          onClose={closeDeleteModal}
          primary={{
            label: deleting ? t('history.deleting') : t('history.delete'),
            onClick: confirmDeleteEntry,
            disabled: deleting,
          }}
          secondary={{
            label: t('history.cancel'),
            onClick: closeDeleteModal,
            disabled: deleting,
          }}
        />
      )}
    </div>
  );
};

export default JournalHistory;
