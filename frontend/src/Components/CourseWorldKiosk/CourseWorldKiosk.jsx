import { useId } from 'react';
import './CourseWorldKiosk.css';

// React sets `muted` as a property only; set it before playback so autoplay is allowed.
const muteVideo = (el) => {
  if (el) el.muted = true;
};

/**
 * What a course world keeper says when the player reaches their kiosk. It is
 * not modal: the player can keep walking, which closes it.
 *
 * `keeper`: { name, img } (img null draws a mystery figure).
 * `clip`: { src, poster, fit?, background?, loop? } or null for no media; with
 * `reducedMotion` the poster is shown instead of the video.
 * `children`: the actions; `onClose` adds a "keep walking" button.
 */
const CourseWorldKiosk = ({ keeper, title, body, alt, clip, reducedMotion, onClose, children }) => {
  const titleId = useId();
  const style = clip?.fit ? { objectFit: clip.fit, background: clip.background } : undefined;

  return (
    <section className="course-world-kiosk" role="dialog" aria-labelledby={titleId}>
      <div className="course-world-kiosk__keeper">
        {keeper.img ? (
          <img className="course-world-kiosk__avatar" src={keeper.img} alt="" />
        ) : (
          <span className="course-world-kiosk__avatar course-world-kiosk__avatar--mystery" aria-hidden="true">
            ?
          </span>
        )}
        <strong className="course-world-kiosk__name">{keeper.name}</strong>
      </div>

      {clip && (
        <div className="course-world-kiosk__media">
          {reducedMotion ? (
            <img src={clip.poster} alt={alt} style={style} />
          ) : (
            <video
              key={clip.src}
              ref={muteVideo}
              src={clip.src}
              poster={clip.poster}
              aria-label={alt}
              style={style}
              autoPlay
              muted
              loop={clip.loop ?? true}
              playsInline
            />
          )}
        </div>
      )}

      <h2 id={titleId} className="course-world-kiosk__title">{title}</h2>
      <p className="course-world-kiosk__body">{body}</p>

      <div className="course-world-kiosk__actions">
        {onClose && (
          <button type="button" className="course-world-kiosk__button" onClick={onClose}>
            Seguir paseando
          </button>
        )}
        {children}
      </div>
    </section>
  );
};

export default CourseWorldKiosk;
