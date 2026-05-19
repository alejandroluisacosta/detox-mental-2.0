import { useEffect, useRef, useState } from "react";
import Onboarding from "./Onboarding";

// Intro-revealed: we set to "true"; OnboardingGate checks getItem(key) === "true".
export default function OnboardingWrapper() {
  const [introState, setIntroState] = useState(
    localStorage.getItem('onboardingRevealed') === null ? 'initial' : 'complete'
  );
  const [fadeIn, setFadeIn] = useState(false);
  const [showWelcomeSecondLine, setShowWelcomeSecondLine] = useState(false);
  const timeoutsRef = useRef({});

  useEffect(() => {
    // If already revealed, skip intro animations
    if (localStorage.getItem('onboardingRevealed') !== null) {
      setFadeIn(true);
      return;
    }

    // Initial intro: "Detox Mental" - shows for 3 seconds
    const t1 = setTimeout(() => setIntroState('welcome'), 3000);
    // Welcome: line1 fade-in, line2 at 2s, line2 visible 3s, then fade-out — 5s total
    const t2 = setTimeout(() => setIntroState('tales'), 8000); // 3 + 5
    // Tales intro: video - shows for ~6 seconds
    const t3 = setTimeout(() => {
      setIntroState('complete');
      localStorage.setItem("onboardingRevealed", "true");
    }, 14000); // 3 + 5 + 6

    timeoutsRef.current = { t1, t2, t3 };

    return () => {
      Object.values(timeoutsRef.current).filter(Boolean).forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (introState === 'complete') {
      const id = requestAnimationFrame(() => setFadeIn(true));
      return () => cancelAnimationFrame(id);
    }
  }, [introState]);

  useEffect(() => {
    if (introState !== 'welcome') {
      setShowWelcomeSecondLine(false);
      return;
    }
    const t = setTimeout(() => setShowWelcomeSecondLine(true), 2000);
    return () => clearTimeout(t);
  }, [introState]);

  if (introState === 'initial') {
    return (
      <div className="intro-screen--onboarding-initial">
        <h1 className="intro-screen__intro-image">Detox Mental</h1>
      </div>
    );
  }

  if (introState === 'welcome') {
    return (
      <div className="intro-screen--welcome">
        <div className="intro-screen__welcome">
          <p className="intro-screen__welcome-line1">
            Bienvenido/a a Detox Mental, tu gimnasio mental virtual.
          </p>
          <p
            className={`intro-screen__welcome-line2${showWelcomeSecondLine ? ' intro-screen__welcome-line2--visible' : ''}`}
          >
            Te presentamos a nuestro <strong>anfitrión</strong>:
          </p>
        </div>
      </div>
    );
  }

  if (introState === 'tales') {
    return (
      <div className="intro-screen--onboarding-tales">
        <div className="intro-screen__content">
          <video
            src="/videos/thales.mp4"
            className="intro-screen__video"
            autoPlay
            muted
            playsInline
          />
          <p className="intro-screen__name">Tales</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`onboarding-container ${fadeIn ? "fade-in" : ""}`}>
      <Onboarding />
    </div>
  );
}
