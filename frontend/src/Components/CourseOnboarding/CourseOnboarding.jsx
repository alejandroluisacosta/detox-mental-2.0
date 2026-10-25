import OnboardingSlideshow from '../OnboardingSlideshow/OnboardingSlideshow.jsx';
import { sessionsData } from '../../data';
import { COURSE_GUIDED_TOUR, COURSE_ONBOARDING_SLIDES } from '../../data/courseOnboarding.js';
import './CourseOnboarding.css';

export const COURSE_ONBOARDING_SEEN_KEY = 'courseOnboardingSeen';

// Sessions whose audio hides a secret character (see the Instructions page).
const SECRET_CHARACTER_SESSIONS = sessionsData.filter((session) =>
  [1, 2, 4, 5, 9, 10, 15].includes(session.id),
);
// Each session stays highlighted, with its character shown, for one step.
const STEP_SECONDS = 1.5;

const SecretCharacterIllustration = () => (
  <div
    className="course-onboarding__characters"
    role="img"
    aria-label="Siete personajes secretos escondidos en las sesiones 1, 2, 4, 5, 9, 10 y 15"
    style={{ '--cycle': `${SECRET_CHARACTER_SESSIONS.length * STEP_SECONDS}s` }}
  >
    <div className="course-onboarding__portrait" aria-hidden="true">
      {SECRET_CHARACTER_SESSIONS.map((session, i) => (
        <img
          key={session.id}
          src={session.img}
          alt=""
          className="course-onboarding__character"
          style={{ animationDelay: `${i * STEP_SECONDS}s` }}
        />
      ))}
    </div>
    <ol className="course-onboarding__sessions" aria-hidden="true">
      {SECRET_CHARACTER_SESSIONS.map((session, i) => (
        <li
          key={session.id}
          className="course-onboarding__session"
          style={{ animationDelay: `${i * STEP_SECONDS}s` }}
        >
          {session.id}
        </li>
      ))}
    </ol>
    <p className="course-onboarding__caption" aria-hidden="true">
      Sesiones con personaje secreto
    </p>
  </div>
);

// The secret-character step has no clip; it shows the illustration instead.
const SLIDES = COURSE_ONBOARDING_SLIDES.map((slide) =>
  slide.id === 'characters' ? { ...slide, media: <SecretCharacterIllustration /> } : slide,
);

const WELCOME = {
  title: 'Bienvenido/a al curso Detox Mental',
  message:
    'Hola, soy Tales. En menos de un minuto te enseño cómo sacarle todo el partido al curso. Puedes volver a verlo cuando quieras con el botón ?.',
  start: 'Empezar',
};

const LABELS = {
  dialog: 'Introducción al curso',
  module: 'Curso',
  step: (current, total) => `Curso · ${current} de ${total}`,
  skip: 'Saltar',
  back: 'Atrás',
  next: 'Siguiente',
  finish: 'Empezar el curso',
  goTo: (n) => `Ir a la diapositiva ${n}`,
};

const CourseOnboarding = ({ onClose, onStartGuidedTour }) => (
  <OnboardingSlideshow
    slides={SLIDES}
    clipBase="/onboarding/course"
    welcome={WELCOME}
    outro={COURSE_GUIDED_TOUR}
    labels={LABELS}
    onClose={onClose}
    onAccept={onStartGuidedTour}
  />
);

export default CourseOnboarding;
