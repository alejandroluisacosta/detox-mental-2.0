import { useEffect, useId, useMemo, useRef, useState } from 'react';
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
import {
  ENTRY_GOAL_TARGETS,
  MEDITATION_GOALS,
  entriesRemaining,
  formatPagesRemaining,
  pagesRemaining,
  readMeditationProgressGoal,
  writeMeditationProgressGoal,
} from '../../utils/meditationPages.js';
import {
  MEDITATIONS_TOPIC,
  filterMeditationEntriesNewestFirst,
  meditationEntriesForPrint,
} from '../../utils/meditationEntries.js';
import {
  meditationCoverAuthor,
  meditationCoverTitle,
  meditationCoverYearSpan,
} from '../../utils/meditationCover.js';
import MeditationBookModal from '../../Components/MeditationBookModal/MeditationBookModal.jsx';
import MeditationFrontMatter from '../../Components/MeditationFrontMatter/MeditationFrontMatter.jsx';
import MeditationPrintCover from '../../Components/MeditationPrintCover/MeditationPrintCover.jsx';
import {
  EMPTY_MEDITATION_FRONT_MATTER,
  normalizeMeditationFrontMatter,
  readDemoMeditationFrontMatter,
  writeDemoMeditationFrontMatter,
} from '../../utils/meditationFrontMatter.js';
import './JournalMeditations.css';

const GOAL_MENU_OPTIONS = [
  MEDITATION_GOALS.BOOK,
  MEDITATION_GOALS.ENTRIES_25,
  MEDITATION_GOALS.ENTRIES_50,
];

const goalMenuLabelKey = {
  [MEDITATION_GOALS.BOOK]: 'meditations.goalBook',
  [MEDITATION_GOALS.ENTRIES_25]: 'meditations.goalEntries25',
  [MEDITATION_GOALS.ENTRIES_50]: 'meditations.goalEntries50',
};

const progressLabelForGoal = (goal, meditationEntries, locale, translate) => {
  if (goal === MEDITATION_GOALS.BOOK) {
    const pages = pagesRemaining(meditationEntries);
    const formatted = formatPagesRemaining(pages, locale);
    return translate('meditations.pagesLeft', { pages: formatted });
  }

  const target = ENTRY_GOAL_TARGETS[goal];
  const remaining = entriesRemaining(meditationEntries, target);

  if (remaining === 0) {
    if (goal === MEDITATION_GOALS.ENTRIES_25) {
      return translate('meditations.entriesGoalReached25');
    }
    return translate('meditations.entriesGoalReached50');
  }

  if (goal === MEDITATION_GOALS.ENTRIES_25) {
    return translate('meditations.entriesLeftToward25', { count: remaining });
  }
  return translate('meditations.entriesLeftToward50', { count: remaining });
};

const formatEntryDate = (iso, locale, unknownLabel) => {
  const formatted = formatLocaleDate(iso, locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return formatted || unknownLabel;
};

const topicsWithoutMeditations = (topics) =>
  (Array.isArray(topics) ? topics : []).filter((topic) => topic !== MEDITATIONS_TOPIC);

const JournalMeditations = () => {
  const { user, status } = useAuth();
  const { demoMode } = useDemoMode();
  const { locale, t } = useLocale();
  const progressMenuId = useId();
  const progressRootRef = useRef(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [entryPendingRemove, setEntryPendingRemove] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [selectedProgressGoal, setSelectedProgressGoal] = useState(() => readMeditationProgressGoal());
  const [progressMenuOpen, setProgressMenuOpen] = useState(false);
  const [progressAnnouncement, setProgressAnnouncement] = useState('');
  const [frontMatter, setFrontMatter] = useState(EMPTY_MEDITATION_FRONT_MATTER);
  const [frontMatterStatus, setFrontMatterStatus] = useState('idle');
  const [savingIntroduction, setSavingIntroduction] = useState(false);
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const demoEntries = useMemo(
    () => (demoMode ? filterMeditationEntriesNewestFirst(getDemoEntries(locale)) : []),
    [demoMode, locale],
  );
  const visibleEntries = demoMode ? demoEntries : entries;
  const printableSourceEntries = demoMode ? demoEntries : entries;
  const printEntries = useMemo(
    () => meditationEntriesForPrint(printableSourceEntries),
    [printableSourceEntries],
  );
  const showCompilation =
    demoMode || (status === 'ready' && user && !loading && visibleEntries.length > 0);
  const showPrintControl = showCompilation;
  const showProgressGoal = demoMode || (status === 'ready' && user && !loading);

  const savedBookForPrint =
    frontMatterStatus === 'ready' ? frontMatter : EMPTY_MEDITATION_FRONT_MATTER;

  const yearSpan = useMemo(
    () => meditationCoverYearSpan(printableSourceEntries, locale),
    [locale, printableSourceEntries],
  );

  const yearsText = useMemo(() => {
    if (yearSpan == null) return null;
    if (yearSpan.start === yearSpan.end) {
      return t('meditations.coverYear', { year: yearSpan.start });
    }
    return t('meditations.coverYearRange', {
      start: yearSpan.start,
      end: yearSpan.end,
    });
  }, [t, yearSpan]);

  const handlePrint = () => {
    window.print();
  };

  const progressLabel = useMemo(
    () => progressLabelForGoal(selectedProgressGoal, visibleEntries, locale, t),
    [locale, selectedProgressGoal, t, visibleEntries],
  );

  useEffect(() => {
    if (!progressMenuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (progressRootRef.current?.contains(event.target)) return;
      setProgressMenuOpen(false);
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setProgressMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [progressMenuOpen]);

  const selectProgressGoal = (goal) => {
    setSelectedProgressGoal(goal);
    writeMeditationProgressGoal(goal);
    setProgressMenuOpen(false);
    setProgressAnnouncement(progressLabelForGoal(goal, visibleEntries, locale, t));
  };

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

  useEffect(() => {
    if (!showCompilation) {
      return undefined;
    }

    if (demoMode) {
      setFrontMatter(readDemoMeditationFrontMatter());
      setFrontMatterStatus('ready');
      return undefined;
    }

    if (!user) {
      return undefined;
    }

    let cancelled = false;

    const loadFrontMatter = async () => {
      setFrontMatterStatus('loading');
      try {
        const res = await apiFetch('/auth/me/journal-meditation-front-matter');
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.frontMatter) {
          throw new Error(data.message || t('meditations.frontMatterLoadFailed'));
        }
        if (!cancelled) {
          setFrontMatter(normalizeMeditationFrontMatter(data.frontMatter));
          setFrontMatterStatus('ready');
        }
      } catch (err) {
        console.error('[journal meditations front matter GET]', err);
        if (!cancelled) {
          setFrontMatterStatus('error');
          emitToast(err.message || t('meditations.frontMatterLoadFailed'));
        }
      }
    };

    loadFrontMatter();
    return () => {
      cancelled = true;
    };
  }, [demoMode, showCompilation, t, user]);

  const saveFrontMatter = async (patch) => {
    if (savingIntroduction || !patch || Object.keys(patch).length === 0) return;

    setSavingIntroduction(true);
    try {
      if (demoMode) {
        const record = writeDemoMeditationFrontMatter(patch);
        setFrontMatter(record);
        emitToast(t('meditations.introductionSaved'));
        return;
      }

      const res = await apiFetch('/auth/me/journal-meditation-front-matter', {
        method: 'PATCH',
        body: patch,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.frontMatter) {
        throw new Error(data.message || t('meditations.introductionSaveFailed'));
      }
      setFrontMatter(normalizeMeditationFrontMatter(data.frontMatter));
      emitToast(t('meditations.introductionSaved'));
    } catch (err) {
      console.error('[journal meditations front matter PATCH]', err);
      emitToast(err.message || t('meditations.introductionSaveFailed'));
    } finally {
      setSavingIntroduction(false);
    }
  };

  const savedIntroductionForPrint =
    frontMatterStatus === 'ready' ? frontMatter.introduction : '';

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
          {showProgressGoal && (
            <div
              className="journal-meditations__pages-left journal-meditations__progress"
              ref={progressRootRef}
            >
              <button
                type="button"
                className="journal-meditations__progress-trigger"
                aria-haspopup="menu"
                aria-expanded={progressMenuOpen}
                aria-controls={progressMenuId}
                aria-label={t('meditations.progressGoalButton')}
                onClick={() => setProgressMenuOpen((open) => !open)}
              >
                {selectedProgressGoal === MEDITATION_GOALS.BOOK ? (
                  <img
                    src="/icons/book.svg"
                    alt=""
                    aria-hidden="true"
                    className="journal-meditations__progress-goal-icon journal-meditations__book-icon"
                  />
                ) : (
                  <img
                    src="/icons/target.svg"
                    alt=""
                    aria-hidden="true"
                    className="journal-meditations__progress-goal-icon journal-meditations__target-icon"
                  />
                )}
                <span className="journal-meditations__pages-left-text">{progressLabel}</span>
                {!progressMenuOpen && (
                  <img
                    src="/icons/arrow_down.svg"
                    alt=""
                    aria-hidden="true"
                    className="journal-meditations__progress-dropdown-icon"
                  />
                )}
              </button>
              {progressMenuOpen && (
                <ul id={progressMenuId} role="menu" className="journal-meditations__progress-menu">
                  {GOAL_MENU_OPTIONS.map((goal) => (
                    <li key={goal} role="none">
                      <button
                        type="button"
                        role="menuitem"
                        className="journal-meditations__progress-menu-item"
                        aria-current={selectedProgressGoal === goal ? 'true' : undefined}
                        onClick={() => selectProgressGoal(goal)}
                      >
                        {t(goalMenuLabelKey[goal])}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <p
                className="journal-meditations__progress-announcement"
                role="status"
                aria-live="polite"
              >
                {progressAnnouncement}
              </p>
            </div>
          )}
          <div className="journal-meditations__header-actions">
            <Link
              to="/journal"
              className="journal-meditations__write-button journal-meditations__write-button--header"
            >
              {t('meditations.write')}
            </Link>
            {showPrintControl && (
              <>
                <button
                  type="button"
                  className="journal-meditations__write-button journal-meditations__write-button--header journal-meditations__write-button--secondary"
                  onClick={() => setBookModalOpen(true)}
                >
                  {t('meditations.bookButton')}
                </button>
                <button
                  type="button"
                  className="journal-meditations__write-button journal-meditations__write-button--header journal-meditations__write-button--secondary journal-meditations__print-button"
                  onClick={handlePrint}
                >
                  {t('meditations.printButton')}
                </button>
              </>
            )}
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

        {showCompilation && (
          <>
            <article
              className="journal-meditations__compilation journal-meditations__compilation--screen"
              aria-label={t('meditations.feedLabel')}
            >
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

            <div
              className="journal-meditations__print-root"
              aria-hidden="true"
              style={{ display: 'none' }}
            >
              <MeditationPrintCover
                title={meditationCoverTitle(savedBookForPrint.title, t('meditations.title'))}
                author={meditationCoverAuthor(savedBookForPrint.authorName)}
                years={yearsText}
              >
                <MeditationFrontMatter introduction={savedIntroductionForPrint} />
              </MeditationPrintCover>
              <article className="journal-meditations__compilation journal-meditations__compilation--print">
                {printEntries.map((entry) => (
                  <section key={`print-${entry.id}`} className="journal-meditations__section">
                    <h2 className="journal-meditations__date">
                      <time dateTime={entry.createdAt}>
                        {formatEntryDate(entry.createdAt, locale, t('meditations.unknownDate'))}
                      </time>
                    </h2>
                    <p className="journal-meditations__text">{entry.content}</p>
                  </section>
                ))}
              </article>
            </div>
          </>
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

      {bookModalOpen && showCompilation && (
        <MeditationBookModal
          title={frontMatter.title}
          authorName={frontMatter.authorName}
          introduction={frontMatter.introduction}
          status={frontMatterStatus === 'idle' ? 'loading' : frontMatterStatus}
          saving={savingIntroduction}
          onClose={() => setBookModalOpen(false)}
          onSave={saveFrontMatter}
        />
      )}

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
