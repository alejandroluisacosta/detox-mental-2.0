import { useEffect, useState } from 'react';
import { getRandomSummaryLoadingQuote } from '../../data/summaryLoadingQuotes.js';
import './JournalSummaryLoadingScreen.css';

// Visual floor so the bar feels intentional even if the API is fast.
const MIN_DISPLAY_MS = 5000;

const JournalSummaryLoadingScreen = ({ ready = false, onDone }) => {
  const [full, setFull] = useState(false);
  const [percent, setPercent] = useState(0);
  const [minElapsed, setMinElapsed] = useState(false);
  const [quote] = useState(getRandomSummaryLoadingQuote);

  useEffect(() => {
    const start = performance.now();
    const frame = requestAnimationFrame(() => setFull(true));

    const tick = () => {
      const elapsed = performance.now() - start;
      const value = Math.min(100, Math.round((elapsed / MIN_DISPLAY_MS) * 100));
      setPercent(value);
      if (value < 100) {
        interval = requestAnimationFrame(tick);
      }
    };
    let interval = requestAnimationFrame(tick);

    const timer = setTimeout(() => setMinElapsed(true), MIN_DISPLAY_MS);
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(interval);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (ready && minElapsed) onDone?.();
  }, [ready, minElapsed, onDone]);

  return (
    <div className="journal-summary-loading-screen">
      <p className="journal-summary-loading-screen__text">
        Preparando tu resumen... [{percent}%]
      </p>
      <div
        className="journal-summary-loading-screen__bar"
        role="progressbar"
        aria-label="Preparando resumen semanal"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={
            'journal-summary-loading-screen__bar-fill' +
            (full ? ' journal-summary-loading-screen__bar-fill--full' : '')
          }
          style={{ transitionDuration: `${MIN_DISPLAY_MS}ms` }}
        />
      </div>
      <p className="journal-summary-loading-screen__quote">{quote}</p>
    </div>
  );
};

export default JournalSummaryLoadingScreen;
