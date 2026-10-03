import { useEffect, useState } from "react";
import { useLocale } from "../../Context/LocaleContext.jsx";
import { useTestExtras } from "../../utils/localizedContent.js";
import "./TestLoadingScreen.css";

const FILL_DURATION_MS = 5000;

const pickQuote = (quotes) =>
  quotes[Math.floor(Math.random() * quotes.length)] ?? "";

export default function TestLoadingScreen({ onDone }) {
  const { t } = useLocale();
  const { loadingQuotes } = useTestExtras();
  const [full, setFull] = useState(false);
  const [percent, setPercent] = useState(0);
  const [quote] = useState(() => pickQuote(loadingQuotes));

  useEffect(() => {
    const start = performance.now();
    const frame = requestAnimationFrame(() => setFull(true));

    const tick = () => {
      const elapsed = performance.now() - start;
      const value = Math.min(100, Math.round((elapsed / FILL_DURATION_MS) * 100));
      setPercent(value);
      if (value < 100) {
        interval = requestAnimationFrame(tick);
      }
    };
    let interval = requestAnimationFrame(tick);

    const timer = setTimeout(() => onDone?.(), FILL_DURATION_MS);
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(interval);
      clearTimeout(timer);
    };
  }, [onDone]);

  return (
    <div className="test-loading-screen">
      <p className="test-loading-screen__text">
        {t('tests.loading', { percent })}
      </p>
      <div
        className="test-loading-screen__bar"
        role="progressbar"
        aria-label={t('tests.loadingAria')}
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={
            "test-loading-screen__bar-fill" +
            (full ? " test-loading-screen__bar-fill--full" : "")
          }
          style={{ transitionDuration: `${FILL_DURATION_MS}ms` }}
        />
      </div>
      <p className="test-loading-screen__quote">{quote}</p>
    </div>
  );
}
