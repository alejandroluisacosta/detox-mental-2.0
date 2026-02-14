import { useEffect, useState } from "react";
import Course from "./Course";

export default function CourseWithIntro() {
  const [showIntro, setShowIntro] = useState(localStorage.getItem('courseRevealed') === null);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowIntro(false), 4500);
    localStorage.setItem("courseRevealed", "");
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!showIntro) {
      const id = requestAnimationFrame(() => setFadeIn(true));
      return () => cancelAnimationFrame(id);
    }
  }, [showIntro]);

  return showIntro ? (
    <div className="intro-screen">
      <div>
        <h1 className="intro-screen__intro-image">Detox Mental</h1>
        <p className="intro-screen__subtitle">en 30 días</p>
      </div>
    </div>
  ) : (
    <div className={`course-container ${fadeIn ? "fade-in" : ""}`}>
      <Course />
    </div>
  );
}
