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
 * `slides`: [{ id, title, body, alt, media?, clip? }]. By default a slide plays
 * `${clipBase}/${desktop|mobile}/${id}.mp4` (clips are recorded per layout) with
 * a `.jpg` still of the same name. `clip` ({ src, poster, fit, background, loop })
 * plays another video instead; `media` shows its own node.
 * `welcome`: { title, message, start }: Tales opens the tour with it.
 * `outro`: { title, body, alt, clip, accept, decline }: a closing choice. `accept`
 * runs `onAccept`; `decline` closes the tour.
 * Neither bookend is counted as a step; the header shows `labels.module` instead.
 * `labels`: { dialog, module, step(current, total), skip, back, next, finish, goTo(n) }.
 */
const OnboardingSlideshow = ({ slides, clipBase, welcome, outro, labels, onClose, onAccept }) => {
  const dialogRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [variant] = useState(() => (mediaMatches(DESKTOP_QUERY) ? 'desktop' : 'mobile'));
  const [reducedMotion] = useState(() => mediaMatches(REDUCED_MOTION_QUERY));

  const allSlides = [
    ...(welcome
      ? [{
          id: 'welcome',
          title: welcome.title,
          media: <TalesWelcome message={welcome.message} />,
          isBookend: true,
        }]
      : []),
    ...slides,
    ...(outro ? [{ id: 'outro', ...outro, isBookend: true, isOutro: true }] : []),
  ];
  const offset = welcome ? 1 : 0;
  const slide = allSlides[index];
  const isLast = index === allSlides.length - 1;
  const nextSlide = allSlides[index + 1];
  const stepNumber = index - offset + 1;
  const clipPath = (id, ext) => `${clipBase}/${variant}/${id}.${ext}`;
  const videoSrc = (s) => s.clip?.src ?? clipPath(s.id, 'mp4');
  const stillSrc = (s) => s.clip?.poster ?? clipPath(s.id, 'jpg');

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
    const style = slide.clip?.fit
      ? { objectFit: slide.clip.fit, background: slide.clip.background }
      : undefined;
    if (reducedMotion) return <img src={stillSrc(slide)} alt={slide.alt} style={style} />;
    return (
      <video
        key={slide.id}
        ref={muteVideo}
        src={videoSrc(slide)}
        poster={stillSrc(slide)}
        aria-label={slide.alt}
        style={style}
        autoPlay
        muted
        loop={slide.clip?.loop ?? true}
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
            {slide.isBookend ? labels.module : labels.step(stepNumber, slides.length)}
          </p>
          <button type="button" className="onboarding-slideshow__skip" onClick={onClose}>
            {labels.skip}
          </button>
        </div>

        <div className="onboarding-slideshow__media">{renderMedia()}</div>
        {!reducedMotion && nextSlide && !nextSlide.media && (
          <link rel="prefetch" as="video" href={videoSrc(nextSlide)} />
        )}

        <div className="onboarding-slideshow__copy">
          <h2 className="onboarding-slideshow__title">{slide.title}</h2>
          {slide.body && <p className="onboarding-slideshow__body">{slide.body}</p>}
        </div>

        <div className="onboarding-slideshow__controls">
          <div className="onboarding-slideshow__dots">
            {allSlides.map(({ id, isBookend, title }, i) => (
              <button
                key={id}
                type="button"
                className={`onboarding-slideshow__dot${i === index ? ' onboarding-slideshow__dot--active' : ''}`}
                onClick={() => setIndex(i)}
                aria-label={isBookend ? title : labels.goTo(i - offset + 1)}
                aria-current={i === index ? 'step' : undefined}
              />
            ))}
          </div>
          {slide.isOutro ? (
            <div className="onboarding-slideshow__actions">
              <button
                type="button"
                className="onboarding-slideshow__button onboarding-slideshow__button--secondary"
                onClick={onClose}
              >
                {outro.decline}
              </button>
              <button type="button" className="onboarding-slideshow__button" onClick={onAccept}>
                {outro.accept}
              </button>
            </div>
          ) : (
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
              {slide.id === 'welcome' ? welcome.start : isLast ? labels.finish : labels.next}
            </button>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingSlideshow;
