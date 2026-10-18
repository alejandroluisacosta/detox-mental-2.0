import { useEffect, useRef, useState } from 'react';
import { useLocale } from '../../Context/LocaleContext.jsx';
import './JournalOnboarding.css';

export const JOURNAL_ONBOARDING_SEEN_KEY = 'journalOnboardingSeen';

const SLIDES = ['journal', 'history', 'summary', 'meditations'];
const DESKTOP_QUERY = '(min-width: 1000px)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const mediaMatches = (query) =>
  typeof window.matchMedia === 'function' && window.matchMedia(query).matches;

// Clips are recorded per layout so mobile users see the mobile UI.
const clipPath = (variant, slide, ext) => `/onboarding/journal/${variant}/${slide}.${ext}`;

// React sets `muted` as a property only; set it before playback so autoplay is allowed.
const muteVideo = (el) => {
  if (el) el.muted = true;
};

const JournalOnboarding = ({ onClose }) => {
  const { t } = useLocale();
  const dialogRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [variant] = useState(() => (mediaMatches(DESKTOP_QUERY) ? 'desktop' : 'mobile'));
  const [reducedMotion] = useState(() => mediaMatches(REDUCED_MOTION_QUERY));

  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;
  const nextSlide = SLIDES[index + 1];
  const alt = t(`journalOnboarding.${slide}.alt`);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const goNext = () => {
    if (isLast) {
      onClose();
      return;
    }
    setIndex((i) => i + 1);
  };

  return (
    <div
      className="modal-overlay journal-onboarding__overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={`journal-onboarding journal-onboarding--${variant} modal-fade-in`}
        role="dialog"
        aria-modal="true"
        aria-label={t('journalOnboarding.dialogLabel')}
        tabIndex={-1}
      >
        <div className="journal-onboarding__header">
          <p className="journal-onboarding__step">
            {t('journalOnboarding.step', { current: index + 1, total: SLIDES.length })}
          </p>
          <button type="button" className="journal-onboarding__skip" onClick={onClose}>
            {t('journalOnboarding.skip')}
          </button>
        </div>

        <div className="journal-onboarding__media">
          {reducedMotion ? (
            <img src={clipPath(variant, slide, 'jpg')} alt={alt} />
          ) : (
            <video
              key={slide}
              ref={muteVideo}
              src={clipPath(variant, slide, 'mp4')}
              poster={clipPath(variant, slide, 'jpg')}
              aria-label={alt}
              autoPlay
              muted
              loop
              playsInline
            />
          )}
        </div>
        {!reducedMotion && nextSlide && (
          <link rel="prefetch" as="video" href={clipPath(variant, nextSlide, 'mp4')} />
        )}

        <div className="journal-onboarding__copy">
          <h2 className="journal-onboarding__title">{t(`journalOnboarding.${slide}.title`)}</h2>
          <p className="journal-onboarding__body">{t(`journalOnboarding.${slide}.body`)}</p>
        </div>

        <div className="journal-onboarding__controls">
          <div className="journal-onboarding__dots">
            {SLIDES.map((id, i) => (
              <button
                key={id}
                type="button"
                className={`journal-onboarding__dot${i === index ? ' journal-onboarding__dot--active' : ''}`}
                onClick={() => setIndex(i)}
                aria-label={t('journalOnboarding.goTo', { n: i + 1 })}
                aria-current={i === index ? 'step' : undefined}
              />
            ))}
          </div>
          <div className="journal-onboarding__actions">
            {index > 0 && (
              <button
                type="button"
                className="journal-onboarding__button journal-onboarding__button--secondary"
                onClick={() => setIndex((i) => i - 1)}
              >
                {t('journalOnboarding.back')}
              </button>
            )}
            <button type="button" className="journal-onboarding__button" onClick={goNext}>
              {isLast ? t('journalOnboarding.finish') : t('journalOnboarding.next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalOnboarding;
