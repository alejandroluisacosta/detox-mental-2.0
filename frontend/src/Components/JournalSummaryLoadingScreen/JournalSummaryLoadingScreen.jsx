import { useEffect, useRef, useState } from 'react';
import { useLocale } from '../../Context/LocaleContext.jsx';
import { pickDistinctQuotes } from '../../data/summaryLoadingQuotes.js';
import {
  getSummaryTaskStatuses,
  SUMMARY_MAX_ATTEMPTS,
  SUMMARY_QUOTE_MS,
  SUMMARY_REVEAL_MS,
  SUMMARY_RITUAL_MS,
} from '../../utils/journalSummaryGenerate.js';
import './JournalSummaryLoadingScreen.css';

const LOADING_TASKS = [
  { copyKey: 'summary.taskReading' },
  {
    copyKey: 'summary.taskSocrates',
    avatarSrc: '/images/socrates.webp',
    avatarAltKey: 'summary.socratesAlt',
  },
  {
    copyKey: 'summary.taskMachiavelli',
    avatarSrc: '/images/machiavelli.webp',
    avatarAltKey: 'summary.machiavelliAlt',
  },
  { copyKey: 'summary.taskFinishing' },
];

const JournalSummaryLoadingScreen = ({
  ready = false,
  attempt = 1,
  onDone,
}) => {
  const { locale, t } = useLocale();
  const [elapsedMs, setElapsedMs] = useState(0);
  const [percent, setPercent] = useState(0);
  const [minElapsed, setMinElapsed] = useState(false);
  const [quotes] = useState(() => pickDistinctQuotes(locale, 3));
  const [quoteIndex, setQuoteIndex] = useState(0);
  const readyRef = useRef(ready);
  readyRef.current = ready;

  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const ritualRatio = Math.min(elapsed / SUMMARY_RITUAL_MS, 1);
      const isReady = readyRef.current;
      setElapsedMs(elapsed);
      setPercent(
        isReady && elapsed >= SUMMARY_RITUAL_MS
          ? 100
          : Math.min(99, Math.round(ritualRatio * 99)),
      );
      if (elapsed >= SUMMARY_RITUAL_MS) setMinElapsed(true);
    };
    tick();
    const interval = setInterval(tick, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (quotes.length === 0) return undefined;
    const timer = setInterval(() => {
      setQuoteIndex((index) => (index + 1) % quotes.length);
    }, SUMMARY_QUOTE_MS);
    return () => clearInterval(timer);
  }, [quotes]);

  useEffect(() => {
    if (!ready || !minElapsed) return undefined;
    setPercent(100);
    const timer = setTimeout(() => onDone?.(), SUMMARY_REVEAL_MS);
    return () => clearTimeout(timer);
  }, [ready, minElapsed, onDone]);

  const overtime = minElapsed && !ready;
  const quote = quotes[quoteIndex] ?? null;
  const displayPercent = ready && minElapsed ? 100 : percent;
  const taskStatuses = getSummaryTaskStatuses(elapsedMs, { ready, minElapsed });

  return (
    <div className="journal-summary-loading-screen">
      <div className="journal-summary-loading-screen__ritual">
        <p className="journal-summary-loading-screen__text">
          {t('summary.preparing')}
        </p>
        {attempt > 1 && (
          <p className="journal-summary-loading-screen__attempt">
            {t('summary.attempt', { n: attempt, total: SUMMARY_MAX_ATTEMPTS })}
          </p>
        )}
        <div
          className="journal-summary-loading-screen__bar"
          role="progressbar"
          aria-label={t('summary.preparingAria')}
          aria-valuenow={displayPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="journal-summary-loading-screen__bar-fill"
            style={{ width: `${displayPercent}%` }}
          />
        </div>
        <p className="journal-summary-loading-screen__percent" aria-hidden="true">
          [{displayPercent}%]
        </p>
      </div>
      <div className="journal-summary-loading-screen__footer">
        <p
          className="journal-summary-loading-screen__still-loading"
          hidden={!overtime}
        >
          {t('summary.stillLoading')}
        </p>
        {quote ? (
          <p className="journal-summary-loading-screen__quote">{quote}</p>
        ) : null}
        <ul
          className="journal-summary-loading-screen__tasks"
          aria-label={t('summary.tasksAria')}
        >
          {LOADING_TASKS.map((task, index) => {
            const status = taskStatuses[index] ?? 'pending';
            const isActive = status === 'active';
            const isCompleted = status === 'completed';
            const markerClass = isCompleted
              ? 'journal-summary-loading-screen__task-marker journal-summary-loading-screen__task-marker--completed'
              : 'journal-summary-loading-screen__task-marker';
            const labelClass = isActive
              ? 'journal-summary-loading-screen__task-label journal-summary-loading-screen__task-label--glow'
              : 'journal-summary-loading-screen__task-label';

            return (
              <li
                key={task.copyKey}
                className={
                  isActive
                    ? 'journal-summary-loading-screen__task journal-summary-loading-screen__task--active'
                    : 'journal-summary-loading-screen__task'
                }
                aria-current={isActive ? 'step' : undefined}
              >
                <span className={markerClass} aria-hidden="true">
                  {isCompleted ? (
                    <svg viewBox="0 0 12 12" width="10" height="10">
                      <path
                        d="M2 6.5 4.8 9.2 10 3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : null}
                </span>
                <span className={labelClass}>{t(task.copyKey)}</span>
                {task.avatarSrc ? (
                  <img
                    src={task.avatarSrc}
                    alt={t(task.avatarAltKey)}
                    className="journal-summary-loading-screen__task-avatar"
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default JournalSummaryLoadingScreen;
