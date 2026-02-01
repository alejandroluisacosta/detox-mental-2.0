import { useEffect, useState } from "react";
import Onboarding from "./Onboarding";

export default function OnboardingWrapper() {
  const [introState, setIntroState] = useState(
    localStorage.getItem('onboardingRevealed') === null ? 'first' : 'complete'
  );
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

    // Second intro: Thales video - shows for ~6 seconds (video length)
    const t2 = setTimeout(() => {
      setIntroState('complete');
      localStorage.setItem("onboardingRevealed", "");
    }, 9000);

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
      <div className="intro-screen--onboarding-1">
        <h1 className="intro-screen__intro-image">Detox Mental</h1>
      </div>
    );
  }

  if (introState === 'second') {
    return (
      <div className="intro-screen--onboarding-2">
        <div className="intro-screen__content">
          <video
            src="/videos/thales.mp4"
            className="intro-screen__video"
            autoPlay
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
