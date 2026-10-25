// Copy for the course onboarding steps, shared by the slideshow and the course world.
export const COURSE_ONBOARDING_SLIDES = [
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
  },
];

// Invites the user to the guided chat with Tales; its video is the chat's own opening.
export const COURSE_GUIDED_TOUR = {
  title: 'Visita guiada con Tales',
  body: 'Te recomendamos empezar con una breve visita guiada: en pocos minutos, Tales te ayuda a sacarle más partido al curso. ¿Quieres hacerla ahora?',
  alt: 'Tales, el anfitrión de Detox Mental',
  clip: {
    src: '/videos/thales.mp4',
    // First frame of the video, so the still and the video share one background.
    poster: '/onboarding/course/guided-tour.jpg',
    fit: 'contain',
    background: '#fcf3ec',
    loop: false,
  },
  accept: 'Sí, empezar la visita',
  decline: 'Ahora no',
};
