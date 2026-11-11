import { useEffect } from 'react';
import './MeditationPrintCover.css';

const COVER_FONTS = ["400 1em 'Cormorant Garamond'", "italic 400 1em 'Cormorant Garamond'"];

// The cover is hidden on screen, so the browser would not fetch its font until
// printing starts and the PDF could fall back to a system serif. Load it early.
const preloadCoverFonts = () => {
  if (typeof document === 'undefined' || !document.fonts?.load) return;
  COVER_FONTS.forEach((font) => {
    document.fonts.load(font).catch(() => {});
  });
};

const CoverOrnament = () => (
  <svg
    className="meditation-print-cover__ornament"
    viewBox="0 0 160 16"
    aria-hidden="true"
    focusable="false"
  >
    <line x1="0" y1="8" x2="66" y2="8" />
    <line x1="94" y1="8" x2="160" y2="8" />
    <path className="meditation-print-cover__ornament-outline" d="M80 1 L87 8 L80 15 L73 8 Z" />
    <path className="meditation-print-cover__ornament-fill" d="M80 5 L83 8 L80 11 L77 8 Z" />
    <circle cx="69" cy="8" r="1.2" />
    <circle cx="91" cy="8" r="1.2" />
  </svg>
);

const MeditationPrintCover = ({ title, author, years, children }) => {
  useEffect(preloadCoverFonts, []);

  return (
    <>
      <section className="meditation-print-cover">
        <div className="meditation-print-cover__frame" aria-hidden="true" />
        <div className="meditation-print-cover__center">
          {title ? <h1 className="meditation-print-cover__title">{title}</h1> : null}
          <CoverOrnament />
          {author != null ? (
            <p className="meditation-print-cover__author">{author}</p>
          ) : null}
        </div>
        {years != null ? <p className="meditation-print-cover__years">{years}</p> : null}
      </section>
      <div
        data-slot="meditation-print-introduction"
        className="meditation-print-cover__introduction-slot"
      >
        {children}
      </div>
    </>
  );
};

export default MeditationPrintCover;
