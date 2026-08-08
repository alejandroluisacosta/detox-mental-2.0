export const DEMO_ENTRIES = [
  {
    id: 'demo-entry-1',
    createdAt: '2026-08-02T18:10:00.000Z',
    topics: ['Reflexión', 'Preocupaciones', 'Trabajo'],
    content:
      'Hoy cambiaron una reunión importante con muy poca antelación y sentí el impulso inmediato de reorganizar toda la semana. Hice tres listas distintas y abrí un documento para pensar escenarios posibles, pero al final la conversación ocurrió igual de rápido de lo que iba a ocurrir. Me doy cuenta de que muchas veces no estoy resolviendo el problema, sino intentando sentir que no me puede sorprender.',
  },
  {
    id: 'demo-entry-2',
    createdAt: '2026-08-01T20:25:00.000Z',
    topics: ['Sabiduría', 'Reflexión'],
    content:
      'Cada vez que algo queda ambiguo, mi reacción es construir estructura alrededor de esa ambigüedad. Lo llamo prudencia y responsabilidad, y en parte lo es, pero también es una forma elegante de no sentirme expuesto. Me cuesta admitir que a veces el orden es menos una herramienta y más un refugio.',
  },
  {
    id: 'demo-entry-3',
    createdAt: '2026-08-01T08:05:00.000Z',
    topics: ['Trabajo', 'Preocupaciones'],
    content:
      'Pasé buena parte de la mañana investigando opciones para una decisión que, sinceramente, ya podía tomar con la información que tenía ayer. Seguí leyendo porque aprender me calma, pero hay un punto en el que investigar deja de aclarar y empieza a retrasar el momento de decidir. Quizá no estaba buscando comprensión, sino permiso para no moverme todavía.',
  },
  {
    id: 'demo-entry-4',
    createdAt: '2026-07-31T22:15:00.000Z',
    topics: ['Interpersonal', 'Reflexión'],
    content:
      'Me sorprendió ver lo paciente que soy con la indecisión de otras personas. Puedo entender que alguien cambie de opinión, improvise y se equivoque. Sin embargo, cuando yo hago exactamente eso, la interpretación interna es mucho más dura: debería haberlo previsto, debería haber sabido más, debería haber diseñado un plan mejor.',
  },
  {
    id: 'demo-entry-5',
    createdAt: '2026-07-31T07:40:00.000Z',
    topics: ['Sabiduría', 'Trabajo'],
    content:
      'Hay una contradicción rara en mi relación con los planes. Digo que planificar me da libertad, pero muchas veces el plan termina diciéndome qué resultados me está permitido aceptar. En cuanto imagino quién debería ser dentro de tres meses, cualquier desviación empieza a sentirse como un fracaso moral en lugar de un ajuste normal.',
  },
  {
    id: 'demo-entry-6',
    createdAt: '2026-07-30T19:55:00.000Z',
    topics: ['Reflexión'],
    content:
      'Hoy tomé una decisión sin justificarla del todo y el mundo no se cayó. Fue extraño porque no tuve el ritual habitual de argumentos, matrices y escenarios. Simplemente elegí una dirección y seguí con el día. No sé todavía si fue la decisión correcta, pero descubrí que puedo tolerar no saberlo de inmediato.',
  },
  {
    id: 'demo-entry-7',
    createdAt: '2026-07-30T09:20:00.000Z',
    topics: ['Preocupaciones', 'Sabiduría'],
    content:
      'Empiezo a sospechar que no siempre tengo miedo a equivocarme. A veces me inquieta más pensar que podría haber querido otra cosa, otra vida o incluso otra versión de mí. Ese tipo de incertidumbre no tiene solución técnica. No hay lista que responda por completo a quién debería haber sido.',
  },
  {
    id: 'demo-entry-8',
    createdAt: '2026-07-29T21:10:00.000Z',
    topics: ['Trabajo', 'Interpersonal'],
    content:
      'Al final ocurrió justo lo que había estado intentando anticipar toda la semana, y la verdad es que mis horas de preparación no cambiaron demasiado el resultado. Lo inquietante es que mi conclusión espontánea no fue relajarme, sino pensar que la próxima vez debería prepararme mejor. Parece lógico, pero también parece una trampa.',
  },
  {
    id: 'demo-entry-9',
    createdAt: '2026-07-28T18:30:00.000Z',
    topics: ['Sabiduría', 'Reflexión', 'Meditaciones'],
    content:
      "Maybe I don't need a better plan. Maybe I need to become better at moving without one.",
  },
  {
    id: 'demo-entry-10',
    createdAt: '2026-07-28T07:55:00.000Z',
    topics: ['Reflexión', 'Preocupaciones'],
    content:
      'Sigo funcionando como si primero tuviera que sentirme seguro y solamente después actuar. Pero quizá muchas decisiones importantes funcionan al revés: actúas y la seguridad, si llega, aparece después. Me pregunto cuánto tiempo llevo optimizando una estrategia cuyo objetivo secreto es eliminar una incertidumbre que la vida no piensa eliminar.',
  },
];

export const DEMO_SUMMARY_PAYLOAD = {
  weekStart: '2026-07-27',
  weekEnd: '2026-08-02',
  canCreate: false,
  entryCount: DEMO_ENTRIES.length,
  minEntries: 2,
  window: {
    open: false,
    enforced: false,
  },
  summary: {
    mainTopics: ['Reflexión', 'Sabiduría', 'Preocupaciones'],
    summaryText:
      'Hay algo revelador en cómo conviertes la necesidad de control en una virtud. En varias de tus entradas aparece la misma secuencia: algo escapa a tus manos, y tu primera reacción es construir una estructura alrededor de la incertidumbre. Haces listas, defines escenarios, preparas alternativas. Lo presentas como prudencia. Como responsabilidad. Como estar preparado. Pero hay una pregunta incómoda debajo de todo ese orden: ¿cuánto de esa preparación sirve realmente para resolver problemas y cuánto sirve para no sentirte expuesto a ellos?\n\nLo interesante es que tú mismo detectas el límite. Cuando finalmente ocurre aquello que estabas intentando anticipar, descubres que muchas de las horas dedicadas a prepararte no habían cambiado el resultado. Sin embargo, tu conclusión no es reducir el control, sino perfeccionarlo: preparar mejor, pensar antes, dejar menos cabos sueltos. Es una respuesta perfectamente lógica si tu objetivo es evitar la incertidumbre. Pero quizá ese sea precisamente el problema. Estás optimizando una estrategia cuyo éxito depende de eliminar algo que la vida no parece dispuesta a eliminar.\n\nHay una contradicción más profunda en tu relación con los planes. Dices que planificar te da libertad porque te permite actuar con intención, pero varias de tus reflexiones describen exactamente lo contrario: el plan empieza como herramienta y termina convirtiéndose en obligación. Una vez que has decidido quién deberías ser dentro de tres meses, cualquier desviación empieza a sentirse como fracaso. La estructura que debía darte libertad comienza a dictarte qué resultados tienes permiso para considerar aceptables.\n\nY aquí aparece algo que no parece accidental. Cuando hablas de otras personas, eres mucho más tolerante con su improvisación. Puedes entender que alguien cambie de opinión, que no tenga claro qué quiere, que pruebe algo y se equivoque. Incluso consideras esas cosas signos de inteligencia o flexibilidad. Pero cuando aplicas el mismo criterio a ti mismo, la interpretación cambia: tú deberías haberlo previsto. Tú deberías haber sabido más. Tú deberías haber tenido un plan mejor. La incertidumbre es sabiduría cuando la ves desde fuera y negligencia cuando la experimentas desde dentro.\n\nTambién llama la atención cómo utilizas el conocimiento como mecanismo de seguridad. Cada vez que aparece una duda, tu impulso es investigar. Y aprender es, por supuesto, útil. Pero en tus propias palabras aparece una diferencia entre aprender para comprender y aprender para poder actuar. A veces sigues acumulando información incluso después de tener suficiente para tomar una decisión. En ese punto, la investigación deja de reducir la incertidumbre y empieza simplemente a retrasar el momento en que tienes que convivir con ella.\n\nQuizá por eso la entrada más significativa de la semana no sea aquella en la que encuentras la mejor solución, sino aquella en la que describes haber tomado una decisión sin sentir que necesitabas justificarla completamente. Hay algo casi extraño en el tono: menos argumentos, menos escenarios, menos necesidad de demostrarte que la elección era correcta. Simplemente decidiste. Y después descubriste que podías tolerar no saber todavía si había sido la decisión correcta.\n\nEso introduce una posibilidad que el resto de tus reflexiones apenas considera: quizá no necesitas convertir la incertidumbre en certeza para poder avanzar. Quizá una parte de tu obsesión por prepararte nace de una premisa que nunca has cuestionado: que primero debes sentirte suficientemente seguro y solamente después actuar, cuando muchas decisiones importantes funcionan precisamente al revés. Actúas, y la seguridad aparece después, si aparece.\n\nTu escritura también deja ver algo más sutil. No parece que tengas miedo únicamente de equivocarte. Parece que te incomoda la posibilidad de descubrir que podrías haber elegido algo distinto. El error puede corregirse. La posibilidad de haber querido otra vida, otra dirección o incluso otra versión de ti mismo es más difícil de encajar en tus sistemas porque no tiene una solución técnica. No puedes hacer una lista que responda a quién deberías haber sido.',
    bestQuote:
      "Maybe I don't need a better plan. Maybe I need to become better at moving without one.",
    socraticText:
      'Si reconoces que gran parte de tu planificación ya no cambia lo que ocurrirá, ¿qué estás intentando conseguir realmente cuando sigues planificando: mejores decisiones o la sensación de estar protegido de las consecuencias de decidir?',
    machiavelliText:
      'Dices que quieres avanzar, pero sigues priorizando una estrategia que evita exponerte a la incertidumbre. ¿Qué posición esperas ganar si protegerte de decidir se ha convertido en el objetivo real?',
  },
};
