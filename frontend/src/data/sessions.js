const sessionsData = [
  {
    id: 1,
    title: "Tú no eres tu mente",
    description: "Y aceptarlo es el primer paso",
    img: "/images/socrates.webp",
    isBlocked: false,
    unblockQuestion: null,
    exercise: {
      question: '¿Quién dijo "Pienso, luego existo"?',
      answer: "DESCARTES",
      text: `Escribe en papel cuáles son los 2-3 pensamientos que más te frenan a la hora de lograr lo que quieres (no me alcanza el tiempo, ahora no me provoca, es muy difícil...). Pueden ser más de 3.\n\nDetállalos bien. Puedes empezar escribiendo los patrones que suelas ver en ti (ej.: «no puedo hacer X porque no soy inteligente», «nunca conseguiré lo que quiero porque mi crianza me dejó dañado», «todo lo que hago, lo hago mal», la voz de tus padres criticándote en lugar de alentarte, preocupaciones por tu salud física o mental, por falta de éxitos, escenarios imaginarios negativos que reaparecen constantemente en tu mente, etc.).\n\nLuego, agrupa los que provengan de la misma raíz. Por ejemplo: pensar que haces todo mal y el juicio de tus padres. La falta de éxito y las dudas sobre tu inteligencia o tu competencia. La preocupación por tu salud y escenarios imaginarios de accidentes donde te haces daño.\n\nSi escribes 5 patrones de pensamientos recurrentes y ves que tres de ellos están enraizados en tu falta de éxitos, agrúpalos en una misma categoría llamada «ambiciones» o «falta de éxitos».\n\nAl finalizar el curso te darás cuenta de que la mayoría de tus PQAs provienen de unas pocas causas principales, y conocer estas causas es información invaluable para empezar a trabajar en ellos.\n\nInvierte al menos 20 minutos en este ejercicio. Si puedes llegar más, mejor. Los primeros minutos serán los más complicados y aburridos, pero cuando las ideas empiecen a fluir, te costará detenerte.\n\nEmpieza a exprimir tu mente y ten los resultados de esta actividad a la mano por el resto del curso.`,
      isBlocked: true
    }
  },
  {
    id: 2,
    title: "Cómo funcionan los pensamientos",
    description: "Pista: nadie lo sabe",
    img: "/images/plato.webp",
    isBlocked: false,
    unblockQuestion: null,
    exercise: {
      question: "¿Quién fundó el psicoanálisis?",
      answer: "FREUD",
      text: 'Reflexiona sobre un pensamiento recurrente que notes hoy.',
      isBlocked: true
    }
  },
  {
    id: 3,
    title: "El gimnasio de la mente",
    description: "La vía rápida del Detox Mental",
    img: "/images/brain.webp",
    isBlocked: false,
    unblockQuestion: null,
    exercise: {
      question: "¿Quién dijo 'Una vida sin examinar no merece ser vivida'?",
      answer: "SOCRATES",
      text: "Escribe un patrón de pensamiento que notes y observa cómo influye en tus decisiones.",
      isBlocked: true
    }
  },
  {
    id: 4,
    title: "Los pensamientos son inofensivos",
    description: "Aunque no lo creas",
    img: "/images/marcus.webp",
    isBlocked: true,
    unblockQuestion: "Describe en máximo dos párrafos los pensamientos que te atormentan o sabotean actualmente.",
    exercise: {
      question: "Según Detox Mental, ¿Cuál es la herramienta #1 para comprender y liberarte de tus PQAs?",
      answer: "ESCRIBIR",
      text: "Escribe un pensamiento repetitivo y observa cómo te afecta.",
      isBlocked: true
    }
  },
  {
    id: 5,
    title: "Sufrimiento imaginario",
    description: "El tormento del ser humano",
    img: "/images/seneca.webp",
    isBlocked: true,
    unblockQuestion: "Describe en máximo dos párrafos un recuerdo o situación actual que te genere PQAs.",
    exercise: {
      question: "¿De qué país era el filósofo Friedrich Nietzsche?",
      answer: "ALEMANIA",
      text: "Escribe un pensamiento recurrente y analiza su impacto en tu día.",
      isBlocked: true
    }
  },
  {
    id: 6,
    title: "Emoción + Pensamiento",
    description: "La clave. El truco. El secreto",
    img: "/images/brain.webp",
    isBlocked: true,
    unblockQuestion: "Describe tus PQAs en 3 palabras.",
    exercise: {
      question: "",
      answer: 'JAMES',
      text: 'Anota tres pensamientos con sus emociones asociadas y observa patrones.',
      isBlocked: true
    }
  },
  {
    id: 7,
    title: "La utilidad de los PQAs",
    description: "Y no lo dudes: la tienen",
    img: "/images/brain.webp",
    isBlocked: true,
    unblockQuestion: "Cuéntanos cómo conociste Detox Mental.",
    exercise: {
      question: '¿Quién escribió "Interpretación de los sueños"?',
      answer: 'FREUD',
      text: 'Escribe un sueño reciente o pensamiento recurrente y reflexiona sobre él.',
      isBlocked: true
    }
  },
  {
    id: 8,
    title: "La raíz de tus PQSs",
    description: '"Emoción atendida, emoción superada"',
    img: "/images/brain.webp",
    isBlocked: true,
    unblockQuestion: "¿Qué emoción predomina en ti cuando tus PQAs se activan? (Tristeza, miedo, ira...)",
    exercise: {
      question: '¿Quién definió la “ventana de tolerancia emocional” en psicología?',
      answer: 'PERRY',
      text: 'Identifica una emoción dominante y anótala.',
      isBlocked: true
    }
  },
  {
    id: 9,
    title: "Cómo se mata un pensamiento",
    description: "Aprende a asesinarlos sin piedad",
    img: "/images/napoleon.webp",
    isBlocked: true,
    unblockQuestion: "¿Sabías que el famoso libro 'Meditaciones' es una especie de diario donde el emperador Marco Aurelio escribía sus PQAs durante sus campañas de guerra? ¿Cuál es tu guerra actual?",
    exercise: {
      question: '¿Quién enseñó la práctica de mindfulness en Occidente moderna?',
      answer: 'KABAT-ZINN',
      text: 'Escribe un pensamiento intrusivo y observa cómo puedes distanciarte de él.',
      isBlocked: true
    }
  },
  {
    id: 10,
    title: "Quietud",
    description: "Aprende a reconocer tus PQSs",
    img: "/images/buddha.webp",
    isBlocked: true,
    unblockQuestion: "¿Qué actividades te ayudan a separarte de tus PQAs o PQSs?",
    exercise: {
      question: '¿Quién es conocido como el fundador del budismo?',
      answer: 'BUDDHA',
      text: 'Elige una actividad diaria y observa tus pensamientos mientras la realizas.',
      isBlocked: true
    }
  },
  {
    id: 11,
    title: "Meditar sin meditar",
    description: "8 herramientas para tu salud mental",
    img: "/images/brain.webp",
    isBlocked: true,
    unblockQuestion: "Dinos tu edad, de qué país eres, y una cosa que te guste de Detox Mental.",
    exercise: {
      question: '¿Qué filósofo japonés popularizó la meditación Zen?',
      answer: 'DŌGEN',
      text: 'Describe un momento breve de observación de tus pensamientos hoy, sin juzgarlos.',
      isBlocked: true
    }
  },
  {
    id: 12,
    title: "Estados de flujo",
    description: "El oasis de la mente",
    img: "/images/brain.webp",
    isBlocked: true,
    unblockQuestion: "¿Recuerdas el momento exacto en el que empezaron tus PQAs? ¿Puedes describirlo?",
    exercise: {
      question: '¿Quién definió el concepto de "flow"?',
      answer: 'CSIKSZENTMIHALYI',
      text: 'Describe una actividad donde pierdes la noción del tiempo y cómo tu mente se siente en calma.',
      isBlocked: true
    }
  },
  {
    id: 13,
    title: "Tú quieres a tus PQSs",
    description: "Increíble, pero cierto",
    img: "/images/brain.webp",
    isBlocked: true,
    unblockQuestion: "¿En cuál de los 5 pasos de la estrategia de Detox Mental necesitas más práctica? (Toma distancia - Reconoce - Comprende - Ármate - Mata).",
    exercise: {
      question: '¿Qué filósofo decía que aceptar un pensamiento lo debilita?',
      answer: 'EPICURO',
      text: 'Escoge un pensamiento recurrente y observa sin reaccionar emocionalmente.',
      isBlocked: true
    }
  },
  {
    id: 14,
    title: "Planificando tu práctica",
    description: "Con ímpetu, pero con calma",
    img: "/images/brain.webp",
    isBlocked: true,
    unblockQuestion: "Dinos algo que mejorarías o cambiarías de Detox Mental.",
    exercise: {
      question: '¿Quién habló sobre la importancia de la disciplina en la vida?',
      answer: 'ARISTÓTELES',
      text: 'Escribe tu plan de práctica diaria y cómo implementarás ejercicios de observación de pensamientos.',
      isBlocked: true
    }
  },
  {
    id: 15,
    title: "Planificando tus fracasos",
    description: "Sella tu proceso con el compromiso que amerita",
    img: "/images/ferriss.webp",
    isBlocked: true,
    unblockQuestion: "Cuéntanos tu experiencia con Detox Mental. ¿Has notado algún cambio positivo?",
    exercise: {
      question: '¿Qué filósofo dijo “La preparación es la clave del éxito”?',
      answer: 'ARISTÓTELES',
      text: 'Piensa en un fallo reciente y anota cómo lo abordarías distinto aplicando lo aprendido.',
      isBlocked: true
    }
  }
];

export default sessionsData;
