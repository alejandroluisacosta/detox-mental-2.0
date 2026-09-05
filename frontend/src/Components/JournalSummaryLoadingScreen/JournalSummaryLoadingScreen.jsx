import { useEffect, useRef, useState } from 'react';
import { useLocale } from '../../Context/LocaleContext.jsx';
import {
  pickDistinctQuotes,
  quoteDisplayMs,
} from '../../data/summaryLoadingQuotes.js';
import {
  SUMMARY_MAX_ATTEMPTS,
  SUMMARY_REVEAL_MS,
  SUMMARY_RITUAL_MS,
} from '../../utils/journalSummaryGenerate.js';
import './JournalSummaryLoadingScreen.css';

const JournalSummaryLoadingScreen = ({
  ready = false,
  attempt = 1,
  onDone,
}) => {
  const { locale, t } = useLocale();
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
    const timers = [];
    let acc = 0;
    quotes.forEach((quote, index) => {
      if (index === 0) return;
      acc += quoteDisplayMs(quotes[index - 1]);
      const nextIndex = index;
      timers.push(setTimeout(() => setQuoteIndex(nextIndex), acc));
    });
    if (quotes.length > 0) {
      acc += quoteDisplayMs(quotes[quotes.length - 1]);
      timers.push(setTimeout(() => setQuoteIndex(-1), acc));
    }
    return () => timers.forEach(clearTimeout);
  }, [quotes]);

  useEffect(() => {
    if (!ready || !minElapsed) return undefined;
    setPercent(100);
    const timer = setTimeout(() => onDone?.(), SUMMARY_REVEAL_MS);
    return () => clearTimeout(timer);
  }, [ready, minElapsed, onDone]);

  const overtime = minElapsed && !ready;
  const quote = overtime || quoteIndex < 0 ? null : quotes[quoteIndex];
  const displayPercent = ready && minElapsed ? 100 : percent;

  return (
    <div className="journal-summary-loading-screen">
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
      {overtime ? (
        <p className="journal-summary-loading-screen__still-loading">
          {t('summary.stillLoading')}
        </p>
      ) : null}
      {quote ? (
        <p className="journal-summary-loading-screen__quote">{quote}</p>
      ) : null}
    </div>
  );
};

export default JournalSummaryLoadingScreen;
