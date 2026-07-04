import { useEffect, useState } from "react";
import "./TestLoadingScreen.css";

// Duration of the simulated fill. Shared between the CSS transition (below)
// and the timeout that reveals the test, so unmount aligns with reaching 100%.
const FILL_DURATION_MS = 2500;

export default function TestLoadingScreen({ onDone }) {
  const [full, setFull] = useState(false);

  useEffect(() => {
    // Start the fill on the next frame so the transition animates from 0.
    const frame = requestAnimationFrame(() => setFull(true));
    const timer = setTimeout(() => onDone?.(), FILL_DURATION_MS);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [onDone]);

  return (
    <div className="test-loading-screen">
      <p className="test-loading-screen__text">Cargando test...</p>
      <div
        className="test-loading-screen__bar"
        role="progressbar"
        aria-label="Cargando test"
      >
        <div
          className={
            "test-loading-screen__bar-fill" +
            (full ? " test-loading-screen__bar-fill--full" : "")
          }
          style={{ transitionDuration: `${FILL_DURATION_MS}ms` }}
        />
      </div>
    </div>
  );
}
