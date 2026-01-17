import { useEffect, useState } from "react";
import Onboarding from "./Onboarding";

export default function OnboardingWrapper() {
  const [introState, setIntroState] = useState(
    localStorage.getItem('onboardingRevealed') === null ? 'first' : 'complete'
  ); // 'first', 'second', 'complete'
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    // If already revealed, skip intro animations
    if (localStorage.getItem('onboardingRevealed') !== null) {
      setFadeIn(true);
      return;
    }

    // First intro: "Detox Mental" - shows for 3 seconds
    const t1 = setTimeout(() => {
      setIntroState('second');
    }, 3000);

    // Second intro: Thales image - shows for 3 seconds
    const t2 = setTimeout(() => {
      setIntroState('complete');
      localStorage.setItem("onboardingRevealed", "");
    }, 6000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (introState === 'complete') {
      const id = requestAnimationFrame(() => setFadeIn(true));
      return () => cancelAnimationFrame(id);
    }
  }, [introState]);

  if (introState === 'first') {
    return (
      <div className="intro-screen">
        <h1 className="intro-screen__intro-image">Detox Mental</h1>
      </div>
    );
  }

  if (introState === 'second') {
    return (
      <div className="intro-screen">
        <div className="intro-screen__content">
          <img 
            src="/images/thales.webp" 
            alt="Thales"
            className="intro-screen__image"
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
