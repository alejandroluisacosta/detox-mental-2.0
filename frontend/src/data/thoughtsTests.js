// Deterministic, frontend-driven thought tests. Keyed by test id so the
// ThoughtsTest page can load any test dynamically from the route param.
// Each test runs as a simulated Tales chat: a set of chip questions, a course
// promo, and a closing journaling prompt. A test may also define an optional
// `recommendation` block: based on the answer to its `keyQuestionId`, Tales
// closes with a recommendation pointing to another test.

const coursePromo = {
  title: "El curso Detox Mental",
  paragraph:
    "Estos pensamientos no tienen por qué controlarte. En el curso aprenderás, paso a paso, a tomar distancia de tu mente y a recuperar la calma.",
  buttonLabel: "Ir al curso",
};

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
    ],
    coursePromo,
    journalingPrompt:
      "Gracias por tu sinceridad. Te dejo una consigna para tu cuaderno: escribe durante 10 minutos sobre ese pensamiento que más estrés te genera, como si se lo contaras a alguien de total confianza. No lo juzgues, solo descríbelo. Al terminar, pregúntate: ¿qué parte de esto depende realmente de mí?",
    recommendation: {
      keyQuestionId: "theme",
      message: "Basado en tus respuestas, te recomiendo el siguiente test:",
      byOption: {
        future: "future-thoughts-1",
        past: "past-thoughts-1",
        self: "personal-thoughts-1",
        others: "relationship-thoughts-1",
      },
    },
  },

  "future-thoughts-1": {
    id: "future-thoughts-1",
    title: "Pensamientos sobre el futuro #1",
    intro:
      "Vamos a explorar esos pensamientos sobre el futuro que te generan estrés. Responde con sinceridad: solo elige lo que más se parezca a tu experiencia.",
    questions: [
      {
        id: "scenario",
        type: "chips",
        prompt: "Cuando piensas en el futuro, ¿qué tipo de escenario sueles imaginar?",
        options: [
          { id: "catastrophe", label: "Lo peor que podría pasar" },
          { id: "uncertainty", label: "No sé qué va a pasar y eso me inquieta" },
          { id: "losing", label: "Perder algo o a alguien importante" },
          { id: "failing", label: "No estar a la altura o fracasar" },
        ],
      },
      {
        id: "area",
        type: "chips",
        prompt: "¿En qué área se concentran más esas preocupaciones?",
        options: [
          { id: "money", label: "Dinero y trabajo" },
          { id: "health", label: "Salud, mía o de los míos" },
          { id: "relationships", label: "Mis relaciones" },
          { id: "purpose", label: "Mi rumbo o propósito en la vida" },
        ],
      },
      {
        id: "likelihood",
        type: "chips",
        prompt: "Cuando imaginas ese escenario, ¿qué tan probable sientes que es?",
        options: [
          { id: "certain", label: "Siento que va a pasar seguro" },
          { id: "likely", label: "Muy probable" },
          { id: "maybe", label: "Tal vez, pero no estoy seguro/a" },
          { id: "unlikely", label: "Sé que es poco probable, pero igual lo pienso" },
        ],
      },
      {
        id: "reaction",
        type: "chips",
        prompt: "¿Qué sueles hacer cuando aparece esa preocupación?",
        options: [
          { id: "overplan", label: "Planifico todo en exceso" },
          { id: "avoid", label: "La evito o me distraigo" },
          { id: "spiral", label: "Le doy vueltas sin parar" },
          { id: "freeze", label: "Me bloqueo y no hago nada" },
        ],
      },
    ],
    coursePromo,
    journalingPrompt:
      "Una consigna para tu cuaderno: escribe con todo detalle el escenario futuro que más temes. Cuando termines, léelo y pregúntate: ¿qué partes dependen de mí y qué pequeño paso podría dar hoy respecto a ellas?",
  },

  "past-thoughts-1": {
    id: "past-thoughts-1",
    title: "Pensamientos sobre el pasado #1",
    intro:
      "Vamos a mirar esos pensamientos sobre el pasado que vuelven una y otra vez. No hay respuestas correctas: solo elige lo que más se parezca a tu experiencia.",
    questions: [
      {
        id: "kind",
        type: "chips",
        prompt: "Cuando piensas en el pasado, ¿qué es lo que más se repite?",
        options: [
          { id: "regret", label: "Algo que hice y de lo que me arrepiento" },
          { id: "omission", label: "Algo que no hice y debí hacer" },
          { id: "replay", label: "Una escena que reproduzco una y otra vez" },
          { id: "hurt", label: "Algo que alguien me hizo" },
        ],
      },
      {
        id: "emotion",
        type: "chips",
        prompt: "¿Qué emoción acompaña a esos recuerdos?",
        options: [
          { id: "guilt", label: "Culpa" },
          { id: "shame", label: "Vergüenza" },
          { id: "anger", label: "Rabia o resentimiento" },
          { id: "sadness", label: "Tristeza o nostalgia" },
        ],
      },
      {
        id: "trigger",
        type: "chips",
        prompt: "¿Qué suele traer esos recuerdos de vuelta?",
        options: [
          { id: "places", label: "Lugares o fechas concretas" },
          { id: "people", label: "Ciertas personas" },
          { id: "quiet", label: "Los momentos de silencio" },
          { id: "nothing", label: "Aparecen sin un motivo claro" },
        ],
      },
      {
        id: "selftalk",
        type: "chips",
        prompt: "Cuando recuerdas eso, ¿cómo te hablas a ti mismo/a?",
        options: [
          { id: "harsh", label: "Me critico con dureza" },
          { id: "whatif", label: "Pienso en lo que hubiera pasado si..." },
          { id: "stuck", label: "Siento que no puedo pasar página" },
          { id: "kind", label: "Intento entenderme, aunque me cuesta" },
        ],
      },
    ],
    coursePromo,
    journalingPrompt:
      "Una consigna para tu cuaderno: escribe esa historia del pasado como si se la contaras a un buen amigo, sin juzgarte. Al terminar, pregúntate: ¿qué aprendí de aquello y qué me gustaría poder soltar?",
  },

  "personal-thoughts-1": {
    id: "personal-thoughts-1",
    title: "Pensamientos sobre ti #1",
    intro:
      "Vamos a explorar esos pensamientos sobre ti mismo/a que te generan estrés. Responde con sinceridad: solo elige lo que más se parezca a tu experiencia.",
    questions: [
      {
        id: "area",
        type: "chips",
        prompt: "¿Sobre qué aspecto de ti suelen tratar estos pensamientos?",
        options: [
          { id: "worth", label: "Mi valía: si soy suficiente" },
          { id: "body", label: "Mi cuerpo o mi aspecto" },
          { id: "capability", label: "Mis capacidades y logros" },
          { id: "identity", label: "Quién soy o quién debería ser" },
        ],
      },
      {
        id: "voice",
        type: "chips",
        prompt: "¿Cómo suena esa voz interior cuando aparece?",
        options: [
          { id: "critic", label: "Como un crítico que no perdona" },
          { id: "compare", label: "Comparándome con los demás" },
          { id: "fraud", label: "Diciéndome que soy un fraude" },
          { id: "demanding", label: "Exigiéndome cada vez más" },
        ],
      },
      {
        id: "frequency",
        type: "chips",
        prompt: "¿Con qué frecuencia escuchas esa voz?",
        options: [
          { id: "constant", label: "Casi siempre está ahí" },
          { id: "daily", label: "Varias veces al día" },
          { id: "triggers", label: "Solo ante ciertas situaciones" },
          { id: "rarely", label: "De vez en cuando" },
        ],
      },
      {
        id: "effect",
        type: "chips",
        prompt: "¿Qué efecto tiene en cómo actúas?",
        options: [
          { id: "avoid", label: "Evito retos por miedo a fallar" },
          { id: "overwork", label: "Me exijo demasiado para demostrar mi valía" },
          { id: "withdraw", label: "Me aíslo o me escondo" },
          { id: "manage", label: "La noto, pero sigo adelante" },
        ],
      },
    ],
    coursePromo,
    journalingPrompt:
      "Una consigna para tu cuaderno: escribe lo que esa voz interior te repite y, debajo, responde como le responderías a alguien a quien quieres. Al terminar, pregúntate: ¿le hablaría así a un buen amigo?",
  },

  "relationship-thoughts-1": {
    id: "relationship-thoughts-1",
    title: "Pensamientos sobre los demás #1",
    intro:
      "Vamos a mirar esos pensamientos sobre tu relación con otras personas que te generan estrés. No hay respuestas correctas: solo elige lo que más se parezca a tu experiencia.",
    questions: [
      {
        id: "who",
        type: "chips",
        prompt: "¿Con quién tienen que ver principalmente estos pensamientos?",
        options: [
          { id: "partner", label: "Mi pareja" },
          { id: "family", label: "Mi familia" },
          { id: "friends", label: "Amistades" },
          { id: "work", label: "Personas del trabajo o estudio" },
        ],
      },
      {
        id: "worry",
        type: "chips",
        prompt: "¿Qué es lo que más te preocupa en esas relaciones?",
        options: [
          { id: "judgement", label: "Que me juzguen o piensen mal de mí" },
          { id: "conflict", label: "Los conflictos o las discusiones" },
          { id: "rejection", label: "Que me dejen de lado o me rechacen" },
          { id: "comparison", label: "Compararme con los demás" },
        ],
      },
      {
        id: "pattern",
        type: "chips",
        prompt: "¿Qué sueles hacer cuando aparece esa preocupación?",
        options: [
          { id: "please", label: "Intento complacer a todos" },
          { id: "overthink", label: "Analizo cada palabra o gesto" },
          { id: "avoid", label: "Evito a la persona o la situación" },
          { id: "react", label: "Reacciono y luego me arrepiento" },
        ],
      },
      {
        id: "aftermath",
        type: "chips",
        prompt: "Después de una interacción difícil, ¿cómo te quedas?",
        options: [
          { id: "replay", label: "Repaso la conversación una y otra vez" },
          { id: "guilt", label: "Con culpa por lo que dije o no dije" },
          { id: "resentment", label: "Con rabia o resentimiento" },
          { id: "calm", label: "Algo incómodo/a, pero lo dejo ir" },
        ],
      },
    ],
    coursePromo,
    journalingPrompt:
      "Una consigna para tu cuaderno: escribe sobre esa relación que te genera estrés, describiendo lo que sientes sin culpar a nadie. Al terminar, pregúntate: ¿qué necesito de verdad en este vínculo y cómo podría expresarlo?",
  },
};
