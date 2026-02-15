import { useEffect, useRef, useState } from "react";
import Onboarding from "./Onboarding";

// Intro-revealed: we set to "true"; OnboardingGate checks getItem(key) === "true".
export default function OnboardingWrapper() {
  const [introState, setIntroState] = useState(
    localStorage.getItem('onboardingRevealed') === null ? 'initial' : 'complete'
  );
  const [fadeIn, setFadeIn] = useState(false);
  const [showTapHint, setShowTapHint] = useState(false);
  const timeoutsRef = useRef({});
  const hasAdvancedRef = useRef(false);

  useEffect(() => {
    // If already revealed, skip intro animations
    if (localStorage.getItem('onboardingRevealed') !== null) {
      setFadeIn(true);
      return;
    }

    // Initial intro: "Detox Mental" - shows for 3 seconds
    const t1 = setTimeout(() => setIntroState('onboarding-intent'), 3000);
    // Onboarding intent: project description - 14s including fade-out
    const t2 = setTimeout(() => setIntroState('tales'), 17000); // 3 + 14
    // Tales intro: video - shows for ~6 seconds
    const t3 = setTimeout(() => {
      setIntroState('complete');
      localStorage.setItem("onboardingRevealed", "true");
    }, 23000); // 3 + 14 + 6

    timeoutsRef.current = { t1, t2, t3 };

    return () => {
      Object.values(timeoutsRef.current).filter(Boolean).forEach(clearTimeout);
    };
  }, []);

  function handleIntentClick() {
    if (hasAdvancedRef.current) return;
    hasAdvancedRef.current = true;

    const { t2, t3 } = timeoutsRef.current;
    if (t2) clearTimeout(t2);
    if (t3) clearTimeout(t3);
    timeoutsRef.current.t2 = null;
    timeoutsRef.current.t3 = null;

    setIntroState('tales');

    const tComplete = setTimeout(() => {
      setIntroState('complete');
      localStorage.setItem("onboardingRevealed", "true");
    }, 6000);
    timeoutsRef.current.tComplete = tComplete;
  }

  useEffect(() => {
    if (introState === 'complete') {
      const id = requestAnimationFrame(() => setFadeIn(true));
      return () => cancelAnimationFrame(id);
    }
  }, [introState]);

  useEffect(() => {
    if (introState !== 'onboarding-intent') {
      setShowTapHint(false);
      return;
    }
    const t = setTimeout(() => setShowTapHint(true), 10000);
    return () => clearTimeout(t);
  }, [introState]);

  if (introState === 'initial') {
    return (
      <div className="intro-screen--onboarding-initial">
        <h1 className="intro-screen__intro-image">Detox Mental</h1>
      </div>
    );
  }

  if (introState === 'onboarding-intent') {
    return (
      <div className="intro-screen--onboarding-intent" onClick={handleIntentClick}>
        <div className="intro-screen__text">
          <p>Detox Mental nació en 2021 como un gimnasio mental virtual para aquellos que quieran liberarse de sus pensamientos tormentosos.</p>
          <p>La meta es que adquieras <strong>dos</strong> hábitos principales para relacionarte mejor con tu mente: la escritura y la meditación.</p>
          <p>Luego de practicar por 30 días, puedes seguir tu camino con apoyo profesional.</p>
          <p>Este es un primer paso.</p>
          <p>Para comenzar, te dejamos en manos de nuestro especial <strong>anfitrión</strong>:</p>
        </div>
        {showTapHint && (
          <span className="intro-screen__tap-hint intro-screen__tap-hint-icon" aria-hidden />
        )}
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
