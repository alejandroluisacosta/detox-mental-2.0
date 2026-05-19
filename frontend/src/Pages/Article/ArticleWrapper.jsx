import { useEffect, useState } from "react";
import Article from "./Article";
import "./Article.css";
import "../Course/Course.css";

export default function ArticleWrapper() {
  const [showIntro, setShowIntro] = useState(
    localStorage.getItem("articleRevealed") === null
  );
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowIntro(false), 4500);
    localStorage.setItem("articleRevealed", "");
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
        <p className="intro-screen__subtitle">la teoría</p>
        <img
          src="/icons/article.webp"
          alt="Ícono de teoría decorativo"
          className="intro-screen__course-icon"
        />
      </div>
    </div>
  ) : (
    <div className={`article-container ${fadeIn ? "fade-in" : ""}`}>
      <Article />
    </div>
  );
}
