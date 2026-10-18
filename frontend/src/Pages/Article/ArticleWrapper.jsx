import { useEffect, useState } from "react";
import Article from "./Article";
import "./Article.css";
import "../Course/Course.css";

export default function ArticleWrapper() {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setFadeIn(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className={`article-container ${fadeIn ? "fade-in" : ""}`}>
      <Article />
    </div>
  );
}
