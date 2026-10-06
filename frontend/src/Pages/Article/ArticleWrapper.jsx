import { useEffect, useState } from "react";
import Article from "./Article";
import { useLocale } from "../../Context/LocaleContext.jsx";
import "./Article.css";
import "../Course/Course.css";

export default function ArticleWrapper() {
  const [showIntro, setShowIntro] = useState(
    localStorage.getItem("articleRevealed") === null
  );
  const [fadeIn, setFadeIn] = useState(false);
  const { t } = useLocale();

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
        <h1 className="intro-screen__intro-image">{t('course.title')}</h1>
        <p className="intro-screen__subtitle">{t('theory.introSubtitle')}</p>
        <img
          src="/icons/article.webp"
          alt={t('theory.introIconAlt')}
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
