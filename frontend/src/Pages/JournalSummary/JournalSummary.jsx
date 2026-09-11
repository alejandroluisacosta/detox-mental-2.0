import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import DemoModeToggle from '../../Components/DemoModeToggle/DemoModeToggle.jsx';
import Navigation from '../../Components/Navigation/Navigation.jsx';
import SummaryCommentModal from '../../Components/SummaryCommentModal/SummaryCommentModal.jsx';
import SummaryCommentTarget from '../../Components/SummaryCommentTarget/SummaryCommentTarget.jsx';
import { useAuth } from '../../Context/AuthContext.jsx';
import { useDemoMode } from '../../Context/DemoModeContext.jsx';
import { useLocale } from '../../Context/LocaleContext.jsx';
import { apiFetch } from '../../api/client.js';
import { getDemoSummaryPayload } from '../../data/demoJournal.js';
import { emitToast } from '../../lib/toastBus.js';
import JournalSummaryLoadingScreen from '../../Components/JournalSummaryLoadingScreen/JournalSummaryLoadingScreen.jsx';
import LoadingStatus from '../../Components/LoadingStatus/LoadingStatus.jsx';
import {
  SUMMARY_ATTEMPT_MS,
  SUMMARY_MAX_ATTEMPTS,
  isGenerateRateLimited,
  shouldRetryGenerate,
} from '../../utils/journalSummaryGenerate.js';
import { formatLocaleDate } from '../../utils/locale.js';
import { resolveSummaryAvailability } from '../../utils/summaryAvailability.js';
import {
  splitSummaryParagraphs,
  truncateSummaryQuote,
} from '../../utils/summaryParagraphs.js';
import { upsertSectionComment } from '../../utils/summaryComments.js';
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

const withDemoFeedback = (payload, demoFeedbackUsed) => {
  if (!payload?.summary) return payload;
  return {
    ...payload,
    summary: {
      ...payload.summary,
      feedbackCount: demoFeedbackUsed ? 1 : 0,
    },
  };
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
  const [pendingRange, setPendingRange] = useState(null);
  const [pendingIsRevise, setPendingIsRevise] = useState(false);
  const [generateAttempt, setGenerateAttempt] = useState(1);
  const [generateExhausted, setGenerateExhausted] = useState(false);
  const [comments, setComments] = useState([]);
  const [activeTarget, setActiveTarget] = useState(null);
  const [demoFeedbackUsed, setDemoFeedbackUsed] = useState(false);
  const commentIdRef = useRef(0);

  const clearComments = () => {
    setComments([]);
    setActiveTarget(null);
  };

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

  const stopGenerating = () => {
    setGenerating(false);
    setGenerateReady(false);
    setPendingSummary(null);
    setPendingRange(null);
    setPendingIsRevise(false);
  };

  const runSummaryPost = async ({ url, body, isRevise }) => {
    setGenerating(true);
    setGenerateExhausted(false);
    setGenerateReady(false);
    setPendingSummary(null);
    setPendingRange(null);
    setPendingIsRevise(Boolean(isRevise));
    setGenerateAttempt(1);

    for (let attempt = 1; attempt <= SUMMARY_MAX_ATTEMPTS; attempt += 1) {
      setGenerateAttempt(attempt);
      setGenerateReady(false);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), SUMMARY_ATTEMPT_MS);
      try {
        const res = await apiFetch(url, {
          method: 'POST',
          signal: controller.signal,
          ...(body ? { body } : {}),
        });
        const data = await res.json().catch(() => ({}));
        if (isGenerateRateLimited(res.status, data)) {
          stopGenerating();
          setGenerateExhausted(true);
          return;
        }
        if (!res.ok) {
          if (shouldRetryGenerate(res.status)) {
            if (attempt < SUMMARY_MAX_ATTEMPTS) continue;
            stopGenerating();
            setGenerateExhausted(true);
            return;
          }
          throw new Error(
            data.message ||
              t(isRevise ? 'summary.reviseFailed' : 'summary.createFailed'),
          );
        }
        setPendingSummary(data.summary ?? null);
        setPendingRange(
          data.weekStart && data.weekEnd
            ? { weekStart: data.weekStart, weekEnd: data.weekEnd }
            : null,
        );
        setGenerateReady(true);
        return;
      } catch (err) {
        const retrying =
          shouldRetryGenerate(null, err) && attempt < SUMMARY_MAX_ATTEMPTS;
        if (!retrying) {
          console.error('[journal-summaries POST]', err);
        }
        if (shouldRetryGenerate(null, err) && attempt < SUMMARY_MAX_ATTEMPTS) {
          continue;
        }
        if (
          shouldRetryGenerate(null, err) &&
          attempt >= SUMMARY_MAX_ATTEMPTS
        ) {
          stopGenerating();
          setGenerateExhausted(true);
          return;
        }
        stopGenerating();
        emitToast(
          err.message ||
            t(isRevise ? 'summary.reviseFailed' : 'summary.createFailed'),
        );
        loadCurrent();
        return;
      } finally {
        clearTimeout(timer);
      }
    }

    stopGenerating();
    setGenerateExhausted(true);
  };

  const handleGenerate = async () => {
    if (generating) return;
    clearComments();

    if (demoMode) {
      setDemoFeedbackUsed(false);
      setGenerating(true);
      setGenerateExhausted(false);
      setGenerateAttempt(1);
      setPendingIsRevise(false);
      setGenerateReady(true);
      return;
    }

    await runSummaryPost({
      url: '/auth/me/journal-summaries/current',
      isRevise: false,
    });
  };

  const handleRevise = async () => {
    if (generating || comments.length === 0) return;

    if (demoMode) {
      setGenerating(true);
      setGenerateExhausted(false);
      setGenerateAttempt(1);
      setPendingIsRevise(true);
      setGenerateReady(true);
      return;
    }

    await runSummaryPost({
      url: '/auth/me/journal-summaries/current/revise',
      body: {
        comments: comments.map(({ section, quotedText, note }) => ({
          section,
          quotedText,
          note,
        })),
      },
      isRevise: true,
    });
  };

  const finishLoadingScreen = useCallback(() => {
    if (pendingSummary) {
      setPayload((prev) => {
        if (!prev) return prev;
        const used =
          pendingSummary.generationCount ?? (prev.quota?.used ?? 0) + 1;
        const limit = prev.quota?.limit ?? 2;
        return {
          ...prev,
          summary: pendingSummary,
          ...(pendingRange ?? {}),
          quota: {
            ...(prev.quota ?? {}),
            used,
            remaining: Math.max(limit - used, 0),
          },
        };
      });
    }
    if (pendingIsRevise && demoMode) {
      setDemoFeedbackUsed(true);
    }
    setComments([]);
    setActiveTarget(null);
    setGenerating(false);
    setGenerateReady(false);
    setPendingSummary(null);
    setPendingRange(null);
    setPendingIsRevise(false);
  }, [demoMode, pendingIsRevise, pendingRange, pendingSummary]);

  const addQueuedComment = (note) => {
    if (!activeTarget) return;
    commentIdRef.current += 1;
    setComments((prev) =>
      upsertSectionComment(prev, {
        id: commentIdRef.current,
        section: activeTarget.section,
        quotedText: activeTarget.quotedText,
        note,
      }),
    );
    setActiveTarget(null);
  };

  if (generating) {
    return (
      <div className="journal-page journal-page--summary">
        <Navigation />
        <JournalSummaryLoadingScreen
          key={generateAttempt}
          attempt={generateAttempt}
          ready={generateReady}
          onDone={finishLoadingScreen}
        />
      </div>
    );
  }

  const effectivePayload = demoMode
    ? withDemoFeedback(getDemoSummaryPayload(locale), demoFeedbackUsed)
    : payload;
  const availability = resolveSummaryAvailability(effectivePayload);
  const summary = availability.displayedSummary;
  const weekLabel = formatWeekLabel(
    effectivePayload?.weekStart,
    effectivePayload?.weekEnd,
    locale,
  );
  const showQuotaExhausted =
    availability.remaining <= 0 && !availability.canRevise;
  const summaryParagraphs = splitSummaryParagraphs(summary?.summaryText ?? '');
  const commentDisabled = !availability.canRevise;
  const commentedSections = new Set(comments.map((comment) => comment.section));

  const openComment = (section, quotedText) => {
    if (commentDisabled) return;
    const existing = comments.find((comment) => comment.section === section);
    setActiveTarget({
      section,
      quotedText,
      note: existing?.note ?? '',
    });
  };

  const commentMark = (section) =>
    commentedSections.has(section) ? (
      <img
        src="/icons/note.svg"
        alt={t('summary.commentMarked')}
        className="journal-summary__comment-mark"
      />
    ) : null;

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

        {(weekLabel ||
          (!demoMode && status === 'ready' && user && !loading && payload)) && (
          <div className="journal-summary__meta">
            {weekLabel && (
              <p className="journal-summary__week">{weekLabel}</p>
            )}
            {!demoMode && status === 'ready' && user && !loading && payload && (
              <p className="journal-summary__quota">
                {showQuotaExhausted
                  ? t('summary.quotaExhausted')
                  : t('summary.quotaRemaining', {
                      remaining: availability.remaining,
                      limit: availability.limit,
                    })}
              </p>
            )}
          </div>
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
            {availability.canRevise && (
              <p className="journal-summary__comment-hint">
                {t('summary.commentHint')}
              </p>
            )}

            <section className="journal-summary__section">
              {commentMark('summaryText')}
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
              {(summaryParagraphs.length > 0
                ? summaryParagraphs
                : [summary.summaryText]
              ).map((paragraph, index) => (
                <SummaryCommentTarget
                  key={`summary-${index}`}
                  className="journal-summary__body"
                  text={paragraph}
                  disabled={commentDisabled}
                  onComment={(quotedText) =>
                    openComment('summaryText', quotedText)
                  }
                />
              ))}
            </section>

            <section className="journal-summary__section">
              {commentMark('bestQuote')}
              <h2 className="journal-summary__heading">{t('summary.bestQuote')}</h2>
              <SummaryCommentTarget
                as="blockquote"
                className="journal-summary__quote"
                text={summary.bestQuote}
                disabled={commentDisabled}
                onComment={(quotedText) =>
                  openComment('bestQuote', quotedText)
                }
              />
            </section>

            <section className="journal-summary__section">
              {commentMark('socraticText')}
              <h2 className="journal-summary__heading journal-summary__heading--socratic">
                <img
                  src="/images/socrates.webp"
                  alt={t('summary.socratesAlt')}
                  className="journal-summary__avatar"
                />
                {t('summary.socraticHeading')}
              </h2>
              <SummaryCommentTarget
                className="journal-summary__socratic"
                text={summary.socraticText}
                disabled={commentDisabled}
                onComment={(quotedText) =>
                  openComment('socraticText', quotedText)
                }
              />
            </section>

            {summary.machiavelliText && (
              <section className="journal-summary__section">
                {commentMark('machiavelliText')}
                <h2 className="journal-summary__heading journal-summary__heading--machiavelli">
                  <img
                    src="/images/machiavelli.webp"
                    alt={t('summary.machiavelliAlt')}
                    className="journal-summary__avatar"
                  />
                  {t('summary.machiavelliHeading')}
                </h2>
                <SummaryCommentTarget
                  className="journal-summary__machiavelli"
                  text={summary.machiavelliText}
                  disabled={commentDisabled}
                  onComment={(quotedText) =>
                    openComment('machiavelliText', quotedText)
                  }
                />
              </section>
            )}

            {comments.length > 0 && (
              <ul className="journal-summary__comment-queue" aria-label={t('summary.commentQueued')}>
                {comments.map((comment) => (
                  <li key={comment.id} className="journal-summary__comment-item">
                    <div className="journal-summary__comment-item-body">
                      <p className="journal-summary__comment-item-quote">
                        {truncateSummaryQuote(comment.quotedText)}
                      </p>
                      <p className="journal-summary__comment-item-note">
                        {comment.note}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="journal-summary__comment-remove"
                      onClick={() =>
                        setComments((prev) =>
                          prev.filter((item) => item.id !== comment.id),
                        )
                      }
                    >
                      {t('summary.commentRemove')}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {!demoMode && generateExhausted && (
              <p className="journal-summary__lead">{t('summary.tryLater')}</p>
            )}
            <div className="journal-summary__actions">
              {availability.canRevise && comments.length > 0 && (
                <button
                  type="button"
                  className="journal-summary__complete-button"
                  onClick={handleRevise}
                >
                  {t('summary.commentSend')}
                </button>
              )}
              {(demoMode ||
                (availability.canRegenerate && !generateExhausted)) && (
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
          </div>
        )}

        {!demoMode && status === 'ready' && user && !loading && !summary && (
          <div className="journal-summary__create">
            {generateExhausted ? (
              <p className="journal-summary__lead">{t('summary.tryLater')}</p>
            ) : availability.canCreate ? (
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

      {activeTarget && (
        <SummaryCommentModal
          key={`${activeTarget.section}-${activeTarget.quotedText.slice(0, 24)}`}
          labelledById="summary-comment-title"
          title={t('summary.commentTitle')}
          quotedText={activeTarget.quotedText}
          placeholder={t('summary.commentPlaceholder')}
          addLabel={
            activeTarget.note
              ? t('summary.commentSave')
              : t('summary.commentAdd')
          }
          cancelLabel={t('summary.commentCancel')}
          initialNote={activeTarget.note}
          onClose={() => setActiveTarget(null)}
          onAdd={addQueuedComment}
        />
      )}
    </div>
  );
};

export default JournalSummary;
