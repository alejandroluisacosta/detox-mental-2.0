import OnboardingSlideshow from '../OnboardingSlideshow/OnboardingSlideshow.jsx';
import { sessionsData } from '../../data';
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

const SLIDES = [
  {
    id: 'article',
    title: 'Lee el artículo',
    body: 'La teoría: una estrategia de cinco pasos para trabajar tus pensamientos. Lo ideal es leerla antes de empezar el curso.',
    alt: 'Desplazándose por el artículo de la teoría',
  },
  {
    id: 'audio',
    title: 'Empieza el audio curso',
    body: '15 sesiones de audio para escuchar a tu ritmo. Lo recomendado es una al día.',
    alt: 'Abriendo la sesión 1 y reproduciendo su audio',
  },
  {
    id: 'exercise',
    title: 'Haz los ejercicios de pensamientos',
    body: 'Cada sesión trae un ejercicio. Responde la pregunta sobre el audio para desbloquearlo y hazlo al terminar de escuchar.',
    alt: 'Respondiendo la pregunta del ejercicio de la sesión 2 y desbloqueándolo',
  },
  {
    id: 'tests',
    title: 'Haz los tests de pensamientos',
    body: 'Conversa con Tales y aprende cómo funcionan tus pensamientos.',
    alt: 'Respondiendo las primeras preguntas del test de pensamientos estresantes',
  },
  {
    id: 'unlock',
    title: 'Desbloquea nuevas sesiones',
    body: 'Compra el curso completo o consigue gratis un código respondiendo una pregunta por correo.',
    alt: 'Introduciendo un código para desbloquear la sesión 4',
  },
  {
    id: 'characters',
    title: 'Adivina el personaje',
    body: 'Hay siete personajes secretos en las sesiones. Si adivinas uno, escríbenos y te damos el código de la sesión que elijas.',
    alt: 'Siete personajes secretos escondidos en las sesiones',
    media: <SecretCharacterIllustration />,
  },
];

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

const CourseOnboarding = ({ onClose }) => (
  <OnboardingSlideshow
    slides={SLIDES}
    clipBase="/onboarding/course"
    welcome={WELCOME}
    labels={LABELS}
    onClose={onClose}
  />
);

export default CourseOnboarding;
