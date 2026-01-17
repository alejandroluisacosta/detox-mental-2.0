import { useEffect, useState } from "react";
import Onboarding from "./Onboarding";

export default function OnboardingWrapper() {
  const [showIntro, setShowIntro] = useState(localStorage.getItem('onboardingRevealed') === null);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowIntro(false), 3000);
    localStorage.setItem("onboardingRevealed", "");
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!showIntro) {
      const id = requestAnimationFrame(() => setFadeIn(true));
      return () => cancelAnimationFrame(id);
    }
  }, [showIntro]);

  return showIntro ? (
    <div className="intro-screen"><h1 className="intro-screen__intro-image">Detox Mental</h1></div>
  ) : (
    <div className={`onboarding-container ${fadeIn ? "fade-in" : ""}`}>
      <Onboarding />
    </div>
  );
}
