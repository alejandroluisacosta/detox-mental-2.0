import { useEffect, useRef, useState } from 'react';
import TalesWelcome from '../TalesWelcome/TalesWelcome.jsx';
import './OnboardingSlideshow.css';

const DESKTOP_QUERY = '(min-width: 1000px)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const mediaMatches = (query) =>
  typeof window.matchMedia === 'function' && window.matchMedia(query).matches;

// React sets `muted` as a property only; set it before playback so autoplay is allowed.
const muteVideo = (el) => {
  if (el) el.muted = true;
};

/**
 * First-visit walkthrough shared by the modules.
 *
 * `slides`: [{ id, title, body, alt, media? }]. Without `media`, the slide plays
 * `${clipBase}/${desktop|mobile}/${id}.mp4` (clips are recorded per layout) with
 * a `.jpg` still of the same name. With `media`, that node is shown instead.
 * `welcome`: { title, message, start }: Tales opens the tour with it. It is not
 * counted as a step; the header shows `labels.module` instead.
 * `labels`: { dialog, module, step(current, total), skip, back, next, finish, goTo(n) }.
 */
const OnboardingSlideshow = ({ slides, clipBase, welcome, labels, onClose }) => {
  const dialogRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [variant] = useState(() => (mediaMatches(DESKTOP_QUERY) ? 'desktop' : 'mobile'));
  const [reducedMotion] = useState(() => mediaMatches(REDUCED_MOTION_QUERY));

  const allSlides = welcome
    ? [
        {
          id: 'welcome',
          title: welcome.title,
          media: <TalesWelcome message={welcome.message} />,
          isWelcome: true,
        },
        ...slides,
      ]
    : slides;
  const offset = welcome ? 1 : 0;
  const slide = allSlides[index];
  const isLast = index === allSlides.length - 1;
  const nextSlide = allSlides[index + 1];
  const stepNumber = index - offset + 1;
  const clipPath = (id, ext) => `${clipBase}/${variant}/${id}.${ext}`;

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

  const renderMedia = () => {
    if (slide.media) return slide.media;
    if (reducedMotion) return <img src={clipPath(slide.id, 'jpg')} alt={slide.alt} />;
    return (
      <video
        key={slide.id}
        ref={muteVideo}
        src={clipPath(slide.id, 'mp4')}
        poster={clipPath(slide.id, 'jpg')}
        aria-label={slide.alt}
        autoPlay
        muted
        loop
        playsInline
      />
    );
  };

  return (
    <div
      className="modal-overlay onboarding-slideshow__overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={`onboarding-slideshow onboarding-slideshow--${variant}`}
        role="dialog"
        aria-modal="true"
        aria-label={labels.dialog}
        tabIndex={-1}
      >
        <div className="onboarding-slideshow__header">
          <p className="onboarding-slideshow__step">
            {slide.isWelcome ? labels.module : labels.step(stepNumber, slides.length)}
          </p>
          <button type="button" className="onboarding-slideshow__skip" onClick={onClose}>
            {labels.skip}
          </button>
        </div>

        <div className="onboarding-slideshow__media">{renderMedia()}</div>
        {!reducedMotion && nextSlide && !nextSlide.media && (
          <link rel="prefetch" as="video" href={clipPath(nextSlide.id, 'mp4')} />
        )}

        <div className="onboarding-slideshow__copy">
          <h2 className="onboarding-slideshow__title">{slide.title}</h2>
          {slide.body && <p className="onboarding-slideshow__body">{slide.body}</p>}
        </div>

        <div className="onboarding-slideshow__controls">
          <div className="onboarding-slideshow__dots">
            {allSlides.map(({ id, isWelcome, title }, i) => (
              <button
                key={id}
                type="button"
                className={`onboarding-slideshow__dot${i === index ? ' onboarding-slideshow__dot--active' : ''}`}
                onClick={() => setIndex(i)}
                aria-label={isWelcome ? title : labels.goTo(i - offset + 1)}
                aria-current={i === index ? 'step' : undefined}
              />
            ))}
          </div>
          <div className="onboarding-slideshow__actions">
            {index > 0 && (
              <button
                type="button"
                className="onboarding-slideshow__button onboarding-slideshow__button--secondary"
                onClick={() => setIndex((i) => i - 1)}
              >
                {labels.back}
              </button>
            )}
            <button type="button" className="onboarding-slideshow__button" onClick={goNext}>
              {slide.isWelcome ? welcome.start : isLast ? labels.finish : labels.next}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingSlideshow;
