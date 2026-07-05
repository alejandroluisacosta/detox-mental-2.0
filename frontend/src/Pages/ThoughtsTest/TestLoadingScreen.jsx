import { useEffect, useState } from "react";
import { getRandomLoadingQuote } from "./loadingQuotes";
import "./TestLoadingScreen.css";

// Duration of the simulated fill. Shared between the CSS transition (below)
// and the timeout that reveals the test, so unmount aligns with reaching 100%.
const FILL_DURATION_MS = 5000;

export default function TestLoadingScreen({ onDone }) {
  const [full, setFull] = useState(false);
  const [percent, setPercent] = useState(0);
  // Pick a quote once per mount (each appearance of the loading screen).
  const [quote] = useState(getRandomLoadingQuote);

  useEffect(() => {
    const start = performance.now();
    // Start the bar fill on the next frame so the transition animates from 0.
    const frame = requestAnimationFrame(() => setFull(true));

    // Drive the numeric percentage in step with the bar's elapsed time.
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
        Cargando test... [{percent}%]
      </p>
      <div
        className="test-loading-screen__bar"
        role="progressbar"
        aria-label="Cargando test"
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
