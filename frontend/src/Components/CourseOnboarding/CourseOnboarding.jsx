import OnboardingSlideshow from '../OnboardingSlideshow/OnboardingSlideshow.jsx';
import './CourseOnboarding.css';

export const COURSE_ONBOARDING_SEEN_KEY = 'courseOnboardingSeen';

// Sessions whose audio hides a secret character (see the Instructions page).
const SECRET_CHARACTER_SESSIONS = [1, 2, 4, 5, 9, 10, 15];

const SecretCharacterIllustration = () => (
  <div
    className="course-onboarding__characters"
    role="img"
    aria-label="Siete personajes secretos escondidos en las sesiones 1, 2, 4, 5, 9, 10 y 15"
  >
    <div className="course-onboarding__silhouette" aria-hidden="true">
      <svg viewBox="0 0 120 120" className="course-onboarding__silhouette-shape">
        <circle cx="60" cy="44" r="24" />
        <path d="M18 120c0-26 19-44 42-44s42 18 42 44z" />
      </svg>
      <span className="course-onboarding__question">?</span>
    </div>
    <ol className="course-onboarding__sessions" aria-hidden="true">
      {SECRET_CHARACTER_SESSIONS.map((n, i) => (
        <li
          key={n}
          className="course-onboarding__session"
          style={{ animationDelay: `${i * 0.45}s` }}
        >
          {n}
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

const LABELS = {
  dialog: 'Introducción al curso',
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
    labels={LABELS}
    onClose={onClose}
  />
);

export default CourseOnboarding;
