import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DemoModeToggle from '../../Components/DemoModeToggle/DemoModeToggle.jsx';
import Navigation from '../../Components/Navigation/Navigation.jsx';
import { useAuth } from '../../Context/AuthContext.jsx';
import { useDemoMode } from '../../Context/DemoModeContext.jsx';
import { useLocale } from '../../Context/LocaleContext.jsx';
import { apiFetch } from '../../api/client.js';
import { getDemoSummaryPayload } from '../../data/demoJournal.js';
import { emitToast } from '../../lib/toastBus.js';
import JournalSummaryLoadingScreen from '../../Components/JournalSummaryLoadingScreen/JournalSummaryLoadingScreen.jsx';
import LoadingStatus from '../../Components/LoadingStatus/LoadingStatus.jsx';
import { formatLocaleDate } from '../../utils/locale.js';
import { resolveSummaryAvailability } from '../../utils/summaryAvailability.js';
import './JournalSummary.css';

const formatWeekLabel = (weekStart, weekEnd, locale) => {
  if (!weekStart || !weekEnd) return '';
  const start = new Date(`${weekStart}T12:00:00`);
  const end = new Date(`${weekEnd}T12:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return `${weekStart} – ${weekEnd}`;
  }
  const startLabel = formatLocaleDate(start, locale, {
    day: 'numeric',
    month: 'long',
  });
  const endLabel = formatLocaleDate(end, locale, {
    day: 'numeric',
    month: 'long',
  });
  return `${startLabel} – ${endLabel}`;
};

const JournalSummary = () => {
  const { user, status } = useAuth();
  const { demoMode } = useDemoMode();
  const { locale, t } = useLocale();
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
        throw new Error(data.message || t('summary.loadFailed'));
      }
      setPayload(data);
    } catch (err) {
      console.error('[journal-summaries GET]', err);
      setPayload(null);
      emitToast(err.message || t('summary.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [demoMode, status, t, user]);

  useEffect(() => {
    loadCurrent();
  }, [loadCurrent]);

  const handleGenerate = async () => {
    if (generating) return;

    setGenerating(true);
    setGenerateReady(false);
    setPendingSummary(null);

    try {
      const res = await apiFetch('/auth/me/journal-summaries/current', {
        method: 'POST',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || t('summary.createFailed'));
      }
      setPendingSummary(data.summary ?? null);
      setGenerateReady(true);
    } catch (err) {
      console.error('[journal-summaries POST]', err);
      setGenerating(false);
      setGenerateReady(false);
      setPendingSummary(null);
      emitToast(err.message || t('summary.createFailed'));
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

  const effectivePayload = demoMode ? getDemoSummaryPayload(locale) : payload;
  const availability = resolveSummaryAvailability(effectivePayload);
  const summary = availability.displayedSummary;
  const weekLabel = formatWeekLabel(
    effectivePayload?.weekStart,
    effectivePayload?.weekEnd,
    locale,
  );

  return (
    <div className="journal-page journal-page--summary">
      <Navigation />
      <main className="journal-page__main journal-summary__main">
        <header className="journal-summary__header journal-summary__header--with-actions">
          <div className="journal-summary__header-top">
            <h1 className="journal-summary__title">{t('summary.title')}</h1>
            <DemoModeToggle />
          </div>
          <div className="journal-summary__header-actions">
            <Link
              to="/journal"
              className="journal-summary__write-button journal-summary__write-button--header"
            >
              {t('summary.write')}
            </Link>
            <Link
              to="/journal/history"
              className="journal-summary__write-button journal-summary__write-button--header journal-summary__write-button--secondary"
            >
              {t('summary.history')}
            </Link>
          </div>
        </header>

        {weekLabel && (
          <p className="journal-summary__week">{weekLabel}</p>
        )}

        {!demoMode && status === 'loading' && (
          <LoadingStatus>{t('summary.loading')}</LoadingStatus>
        )}

        {!demoMode && status === 'ready' && !user && (
          <div className="journal-summary__empty">
            <p>{t('summary.guestEmpty')}</p>
            <Link to="/login" className="journal-summary__action-link">
              {t('summary.login')}
            </Link>
          </div>
        )}

        {!demoMode && status === 'ready' && user && loading && (
          <LoadingStatus>{t('summary.loadingSummary')}</LoadingStatus>
        )}

        {(demoMode || (status === 'ready' && user && !loading && summary)) && (
          <div className="journal-summary__result">
            <section className="journal-summary__section">
              <h2 className="journal-summary__heading">{t('summary.thisWeek')}</h2>
              {Array.isArray(summary.mainTopics) &&
                summary.mainTopics.length > 0 && (
                  <ul
                    className="journal-summary__topics"
                    aria-label={t('summary.mainTopics')}
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
              <h2 className="journal-summary__heading">{t('summary.bestQuote')}</h2>
              <blockquote className="journal-summary__quote">
                {summary.bestQuote}
              </blockquote>
            </section>

            <section className="journal-summary__section">
              <h2 className="journal-summary__heading journal-summary__heading--socratic">
                <img
                  src="/images/socrates.webp"
                  alt={t('summary.socratesAlt')}
                  className="journal-summary__avatar"
                />
                {t('summary.socraticHeading')}
              </h2>
              <p className="journal-summary__socratic">{summary.socraticText}</p>
            </section>

            {summary.machiavelliText && (
              <section className="journal-summary__section">
                <h2 className="journal-summary__heading journal-summary__heading--machiavelli">
                  <img
                    src="/images/machiavelli.webp"
                    alt={t('summary.machiavelliAlt')}
                    className="journal-summary__avatar"
                  />
                  {t('summary.machiavelliHeading')}
                </h2>
                <p className="journal-summary__machiavelli">
                  {summary.machiavelliText}
                </p>
              </section>
            )}

            {!demoMode && (
              <div className="journal-summary__regenerate">
                <button
                  type="button"
                  className="journal-summary__complete-button journal-summary__complete-button--secondary"
                  onClick={handleGenerate}
                >
                  {t('summary.regenerate')}
                </button>
              </div>
            )}
          </div>
        )}

        {!demoMode && status === 'ready' && user && !loading && !summary && (
          <div className="journal-summary__create">
            {availability.canCreate ? (
              <>
                <p className="journal-summary__lead">
                  {t('summary.createLead')}
                </p>
                <button
                  type="button"
                  className="journal-summary__complete-button"
                  onClick={handleGenerate}
                >
                  {t('summary.create')}
                </button>
              </>
            ) : (
              <div className="journal-summary__empty">
                {availability.entryCount < availability.minEntries ? (
                  <>
                    <p>
                      {t('summary.needEntries', {
                        minEntries: availability.minEntries,
                        entryCount: availability.entryCount,
                      })}
                    </p>
                    <Link to="/journal" className="journal-summary__action-link">
                      {t('summary.write')}
                    </Link>
                  </>
                ) : availability.windowEnforced && !availability.windowOpen ? (
                  <p>{t('summary.windowClosed')}</p>
                ) : (
                  <p>{t('summary.unavailable')}</p>
                )}
              </div>
            )}
          </div>
        )}

        {(demoMode || status !== 'loading') && (
          <Link
            to="/journal"
            className="journal-summary__write-button journal-summary__write-button--footer"
          >
            {t('summary.writeFooter')}
          </Link>
        )}
      </main>
    </div>
  );
};

export default JournalSummary;
