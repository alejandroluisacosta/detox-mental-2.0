// Deterministic, frontend-driven thought tests. Keyed by test id so the
// ThoughtsTest page can load any test dynamically from the route param.
// Each test runs as a simulated Tales chat: a set of chip questions, one
// final free-text question, a course promo, and a closing journaling prompt.

export const thoughtsTests = {
  "stressing-thoughts-1": {
    id: "stressing-thoughts-1",
    title: "Pensamientos estresantes #1",
    intro:
      "Hola de nuevo. Bienvenido/a al primer test sobre pensamientos estresantes. No hay respuestas correctas ni incorrectas: solo elige lo que más se parezca a tu experiencia.",
    questions: [
      {
        id: "frequency",
        type: "chips",
        prompt: "Para empezar, ¿con qué frecuencia aparecen estos pensamientos?",
        options: [
          { id: "constantly", label: "Casi todo el día" },
          { id: "daily", label: "Varias veces al día" },
          { id: "sometimes", label: "Algunas veces por semana" },
          { id: "rarely", label: "De vez en cuando" },
        ],
      },
      {
        id: "moment",
        type: "chips",
        prompt: "¿En qué momento suelen aparecer con más fuerza?",
        options: [
          { id: "morning", label: "Al despertar" },
          { id: "work", label: "Mientras trabajo o estudio" },
          { id: "night", label: "Por la noche, antes de dormir" },
          { id: "alone", label: "Cuando estoy a solas" },
        ],
      },
      {
        id: "theme",
        type: "chips",
        prompt: "¿Sobre qué tratan principalmente?",
        options: [
          { id: "future", label: "El futuro y lo que podría salir mal" },
          { id: "past", label: "Cosas del pasado que repaso una y otra vez" },
          { id: "self", label: "Lo que pienso sobre mí mismo/a" },
          { id: "others", label: "Mi relación con otras personas" },
        ],
      },
      {
        id: "impact",
        type: "chips",
        prompt: "¿Cómo afectan tu día a día?",
        options: [
          { id: "sleep", label: "Me cuesta dormir o descansar" },
          { id: "focus", label: "Me cuesta concentrarme" },
          { id: "mood", label: "Afectan mi estado de ánimo" },
          { id: "manage", label: "Los noto, pero logro seguir adelante" },
        ],
      },
      {
        id: "reflection",
        type: "text",
        prompt:
          "Por último, escríbeme con tus palabras: ¿cuál es el pensamiento que más estrés te genera últimamente?",
      },
    ],
    coursePromo: {
      title: "El curso Detox Mental",
      paragraph:
        "Estos pensamientos no tienen por qué controlarte. En el curso aprenderás, paso a paso, a tomar distancia de tu mente y a recuperar la calma.",
      buttonLabel: "Ir al curso",
    },
    journalingPrompt:
      "Gracias por tu sinceridad. Te dejo una consigna para tu cuaderno: escribe durante 10 minutos sobre ese pensamiento que más estrés te genera, como si se lo contaras a alguien de total confianza. No lo juzgues, solo descríbelo. Al terminar, pregúntate: ¿qué parte de esto depende realmente de mí?",
  },
};
