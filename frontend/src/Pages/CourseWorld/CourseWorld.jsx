import { Suspense, lazy, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CourseWorld.css';
import TalesWelcome from '../../Components/TalesWelcome/TalesWelcome.jsx';
import CourseWorldKiosk from '../../Components/CourseWorldKiosk/CourseWorldKiosk.jsx';
import { COURSE_ONBOARDING_SEEN_KEY } from '../../Components/CourseOnboarding/CourseOnboarding.jsx';
import { COURSE_GUIDED_TOUR, COURSE_ONBOARDING_SLIDES } from '../../data/courseOnboarding.js';
import { COURSE_WORLD_HOST, COURSE_WORLD_KEEPERS } from '../../data/courseWorld.js';
import { GOAL_ID, buildWorldLayout } from '../../utils/courseWorld.js';

// Three.js is only downloaded by visitors who open the world.
const CourseWorldScene = lazy(() => import('../../Components/CourseWorldScene/CourseWorldScene.jsx'));

const DESKTOP_QUERY = '(min-width: 1000px)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const mediaMatches = (query) =>
  typeof window.matchMedia === 'function' && window.matchMedia(query).matches;

const KIOSKS = COURSE_ONBOARDING_SLIDES.map((slide) => ({ ...slide, keeper: COURSE_WORLD_KEEPERS[slide.id] }));
const LAYOUT = buildWorldLayout(KIOSKS.map((k) => k.id));

const WELCOME_MESSAGE =
  'Hola, soy Tales. Paseemos juntos por esta calle: en cada kiosco alguien te cuenta una parte del curso. Al final del camino te espero en mi pórtico.';

const CourseWorld = () => {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [stopId, setStopId] = useState(null);
  const [dismissedId, setDismissedId] = useState(null);
  const [visited, setVisited] = useState(() => new Set());
  const [teleport, setTeleport] = useState(null);
  const [sceneUnavailable, setSceneUnavailable] = useState(false);
  const [variant] = useState(() => (mediaMatches(DESKTOP_QUERY) ? 'desktop' : 'mobile'));
  const [reducedMotion] = useState(() => mediaMatches(REDUCED_MOTION_QUERY));

  const arriveAt = useCallback((id) => {
    setStopId(id);
    // A keeper closed with "Seguir paseando" talks again on the next visit.
    setDismissedId(null);
    if (id && id !== GOAL_ID) setVisited((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }, []);

  const goToKiosk = (kiosk) => {
    const spot = kiosk ? LAYOUT.kiosks.find((k) => k.id === kiosk.id).spot : LAYOUT.goal;
    setStarted(true);
    setTeleport({ position: spot, key: Date.now() });
    arriveAt(kiosk ? kiosk.id : GOAL_ID);
  };

  const leave = (path) => {
    localStorage.setItem(COURSE_ONBOARDING_SEEN_KEY, 'true');
    navigate(path);
  };

  const activeKiosk = stopId !== dismissedId ? KIOSKS.find((k) => k.id === stopId) : null;
  const atGoal = stopId === GOAL_ID && dismissedId !== GOAL_ID;

  const kioskClip = (kiosk) =>
    kiosk.keeper.hasClip
      ? {
          src: `/onboarding/course/${variant}/${kiosk.id}.mp4`,
          poster: `/onboarding/course/${variant}/${kiosk.id}.jpg`,
        }
      : null;

  return (
    <div className="course-world">
      {sceneUnavailable ? (
        <p className="course-world__fallback">
          Tu navegador no puede mostrar el paseo en 3D. Elige un kiosco de la lista para conocer el curso.
        </p>
      ) : (
        <Suspense fallback={<p className="course-world__loading">Preparando el paseo…</p>}>
          <CourseWorldScene
            layout={LAYOUT}
            kiosks={KIOSKS}
            host={COURSE_WORLD_HOST}
            visited={visited}
            paused={!started}
            reducedMotion={reducedMotion}
            teleport={teleport}
            onStopChange={arriveAt}
            onUnavailable={() => setSceneUnavailable(true)}
          />
        </Suspense>
      )}

      <header className="course-world__hud">
        <button type="button" className="course-world__exit" onClick={() => leave('/course')}>
          Salir
        </button>
        <p className="course-world__counter" aria-live="polite">
          Kioscos visitados: {visited.size} de {KIOSKS.length}
        </p>
      </header>

      {started && !sceneUnavailable && !activeKiosk && !atGoal && (
        <p className="course-world__hint">
          {variant === 'desktop'
            ? 'Camina con las flechas o WASD, o haz clic en la calle.'
            : 'Toca la calle para caminar.'}
        </p>
      )}

      <nav className="course-world__list" aria-label="Kioscos del paseo">
        <ol>
          {KIOSKS.map((kiosk) => (
            <li key={kiosk.id}>
              <button
                type="button"
                className={`course-world__list-item${visited.has(kiosk.id) ? ' course-world__list-item--visited' : ''}`}
                onClick={() => goToKiosk(kiosk)}
              >
                {kiosk.title}
              </button>
            </li>
          ))}
          <li>
            <button type="button" className="course-world__list-item" onClick={() => goToKiosk(null)}>
              {COURSE_GUIDED_TOUR.title}
            </button>
          </li>
        </ol>
      </nav>

      {!started && (
        <div className="course-world__welcome">
          <div className="course-world__welcome-card">
            <div className="course-world__welcome-media">
              <TalesWelcome message={WELCOME_MESSAGE} />
            </div>
            <div className="course-world__welcome-actions">
              <button type="button" className="course-world__secondary" onClick={() => leave('/course')}>
                Saltar
              </button>
              <button type="button" onClick={() => setStarted(true)}>
                Empezar el paseo
              </button>
            </div>
          </div>
        </div>
      )}

      {activeKiosk && (
        <CourseWorldKiosk
          keeper={activeKiosk.keeper}
          title={activeKiosk.title}
          body={activeKiosk.body}
          alt={activeKiosk.alt}
          clip={kioskClip(activeKiosk)}
          reducedMotion={reducedMotion}
          onClose={() => setDismissedId(activeKiosk.id)}
        />
      )}

      {atGoal && (
        <CourseWorldKiosk
          keeper={COURSE_WORLD_HOST}
          title={COURSE_GUIDED_TOUR.title}
          body={COURSE_GUIDED_TOUR.body}
          alt={COURSE_GUIDED_TOUR.alt}
          clip={COURSE_GUIDED_TOUR.clip}
          reducedMotion={reducedMotion}
        >
          <button type="button" className="course-world__secondary" onClick={() => leave('/course')}>
            {COURSE_GUIDED_TOUR.decline}
          </button>
          <button type="button" onClick={() => leave('/onboarding')}>
            {COURSE_GUIDED_TOUR.accept}
          </button>
        </CourseWorldKiosk>
      )}
    </div>
  );
};

export default CourseWorld;
