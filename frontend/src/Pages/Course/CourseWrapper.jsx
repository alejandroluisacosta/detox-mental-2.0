import { useEffect, useState } from "react";
import Course from "./Course";

export default function CourseWithIntro() {
  const [showIntro, setShowIntro] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowIntro(false), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!showIntro) {
      const id = requestAnimationFrame(() => setFadeIn(true));
      return () => cancelAnimationFrame(id);
    }
  }, [showIntro]);

  return showIntro ? (
    <div className="intro-screen"><h1 className="intro-screen__title">Detox Mental</h1></div>
  ) : (
    <div className={`course-container ${fadeIn ? "fade-in" : ""}`}>
      <Course />
    </div>
  );
}
