/** Last chip: starts the existing challenge flow (time selection → …). */
export const CHALLENGE_CHIP_ID = "challenge";

export const FOLLOW_UP_QUESTION = "¿Qué te gustaría saber ahora?";

export const FOOTER_BEFORE_CHALLENGE =
  "Dime cuando estés preparado/a y haremos un mini-desafío para ver qué tan claros son tus pensamientos ahora mismo. Luego te diré por dónde te recomendamos empezar.";

/** Short intro on first open (placeholder tone; edit anytime). */
export const FAQ_INTRO = `Bienvenido/a a Detox Mental, tu gimnasio mental virtual.

Yo soy Tales, tu guía al inicio de este proceso.

Te explico dónde estás:

**Detox Mental** es una aplicación para ayudarte a relacionarte mejor con pensamientos que te generan estrés, sin sustituir terapia ni consejo médico.

Aquí tienes respuestas rápidas a lo que suelen preguntarse quienes nos visitan por primera vez.`

/**
 * Ordered FAQ chips (excluding the challenge chip).
 * @type {{ id: string, label: string, markdownBody: string }[]}
 */
export const FAQ_ENTRIES = [
  {
    id: "how_to_use",
    label: "¿Cómo se utiliza la aplicación?",
    markdownBody: `Esta aplicación consta de **dos partes**: un **artículo** y un **curso de 15 días**.

La idea es que **leas el artículo primero** para ganar contexto —presenta una estrategia en **cinco pasos** para trabajar tus pensamientos con claridad; puedes leerlo en un día o repartirlo. **No es obligatorio** antes del curso, pero es lo ideal.

El **curso** amplía el artículo: son **15 sesiones de audio** con **15 ejercicios** (uno por sesión). Lo recomendado es una sesión al día, pero puedes ir a tu ritmo. Las **tres primeras sesiones** están desbloqueadas; las demás se desbloquean con un código (por ejemplo respondiendo un mini-desafío por correo o acertando personajes secretos en el curso —los detalles están en la página de instrucciones de la app).`
  },
  {
    id: "time_investment",
    label: "¿Cuánto tiempo tengo que invertir?",
    markdownBody:
      "[Placeholder] Aquí irá una respuesta sobre cuánto tiempo suele invertirse en el artículo y en el curso, y que el ritmo es flexible."
  },
  {
    id: "course_duration",
    label: "¿Cuánto dura el curso?",
    markdownBody:
      "[Placeholder] Aquí irá una respuesta sobre la duración del curso (por ejemplo 15 días al ritmo de una sesión diaria) y que puede alargarse si lo prefieres."
  },
  {
    id: "app_story",
    label: "¿Cuál es la historia de esta aplicación?",
    markdownBody: "[Placeholder] Aquí irá la historia y el propósito del proyecto Detox Mental."
  },
  {
    id: "creator",
    label: "¿Quién creó esta aplicación?",
    markdownBody: "[Placeholder] Aquí irá información sobre la persona o el equipo detrás de la aplicación."
  },
  {
    id: "medical_backing",
    label: "¿Esto está respaldado por profesionales de la medicina?",
    markdownBody:
      "[Placeholder] Aquí irá una aclaración honesta sobre evidencia, límites del contenido y cuándo conviene acudir a un profesional de salud mental."
  }
];

export function getFaqById(id) {
  return FAQ_ENTRIES.find((e) => e.id === id);
}
