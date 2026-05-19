import { useEffect, useState } from "react";
import Article from "./Article";
import "./Article.css";

export default function ArticleWrapper() {
  const [showIntro, setShowIntro] = useState(
    localStorage.getItem("articleRevealed") === null
  );
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowIntro(false), 7000);
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
    <div className="article-intro">
      <div>
        <p className="article-intro__portion article-intro__portion--1">
          Cómo liberarte
        </p>
        <p className="article-intro__portion article-intro__portion--2">
          de los pensamientos que te atormentan
        </p>
        <p className="article-intro__portion article-intro__portion--3">
          en 5 pasos
        </p>
        <img
          src="/icons/article.webp"
          alt="Ícono de teoría decorativo"
          className="article-intro__icon"
        />
      </div>
    </div>
  ) : (
    <div className={`article-container ${fadeIn ? "fade-in" : ""}`}>
      <Article />
    </div>
  );
}
