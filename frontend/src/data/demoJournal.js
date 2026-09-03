import { parseLocale } from '../utils/locale.js';

const DEMO_ENTRIES_EN = [
  {
    id: 'demo-entry-1',
    createdAt: '2026-08-02T18:10:00.000Z',
    topics: ['reflection', 'worries', 'work'],
    content:
      'Today they moved an important meeting with very little notice and I felt the immediate urge to reorganize the entire week. I made three different lists and opened a document to think through possible scenarios, but in the end the conversation happened just as quickly as it was going to happen. I realize that often I am not solving the problem; I am trying to feel that it cannot surprise me.',
  },
  {
    id: 'demo-entry-2',
    createdAt: '2026-08-01T20:25:00.000Z',
    topics: ['wisdom', 'reflection'],
    content:
      'Every time something stays ambiguous, my reaction is to build structure around that ambiguity. I call it prudence and responsibility, and in part it is, but it is also an elegant way of not feeling exposed. I find it hard to admit that sometimes order is less a tool and more a refuge.',
  },
  {
    id: 'demo-entry-3',
    createdAt: '2026-08-01T08:05:00.000Z',
    topics: ['work', 'worries'],
    content:
      'I spent a good part of the morning researching options for a decision that, honestly, I could already make with the information I had yesterday. I kept reading because learning calms me, but there is a point where investigating stops clarifying and starts delaying the moment of deciding. Maybe I was not looking for understanding, but for permission not to move yet.',
  },
  {
    id: 'demo-entry-4',
    createdAt: '2026-07-31T22:15:00.000Z',
    topics: ['interpersonal', 'reflection'],
    content:
      'I was surprised to see how patient I am with other people’s indecision. I can understand that someone changes their mind, improvises, and gets it wrong. When I do exactly that, though, the inner interpretation is much harsher: I should have anticipated it, I should have known more, I should have designed a better plan.',
  },
  {
    id: 'demo-entry-5',
    createdAt: '2026-07-31T07:40:00.000Z',
    topics: ['wisdom', 'work'],
    content:
      'There is a strange contradiction in my relationship with plans. I say that planning gives me freedom, but often the plan ends up telling me which results I am allowed to accept. As soon as I imagine who I should be in three months, any deviation starts to feel like a moral failure instead of a normal adjustment.',
  },
  {
    id: 'demo-entry-6',
    createdAt: '2026-07-30T19:55:00.000Z',
    topics: ['reflection'],
    content:
      'Today I made a decision without fully justifying it and the world did not fall apart. It felt strange because I did not have the usual ritual of arguments, matrices, and scenarios. I simply chose a direction and continued with the day. I still do not know if it was the right decision, but I discovered that I can tolerate not knowing it immediately.',
  },
  {
    id: 'demo-entry-7',
    createdAt: '2026-07-30T09:20:00.000Z',
    topics: ['worries', 'wisdom'],
    content:
      'I am starting to suspect that I am not always afraid of being wrong. Sometimes what unsettles me more is thinking that I could have wanted something else, another life, or even another version of myself. That kind of uncertainty has no technical solution. There is no list that fully answers who I should have been.',
  },
  {
    id: 'demo-entry-8',
    createdAt: '2026-07-29T21:10:00.000Z',
    topics: ['work', 'interpersonal'],
    content:
      'In the end, exactly what I had been trying to anticipate all week happened, and the truth is that my hours of preparation did not change the result much. The unsettling part is that my spontaneous conclusion was not to relax, but to think that next time I should prepare better. It seems logical, but it also looks like a trap.',
  },
  {
    id: 'demo-entry-9',
    createdAt: '2026-07-28T18:30:00.000Z',
    topics: ['wisdom', 'reflection', 'meditations'],
    content:
      "Maybe I don't need a better plan. Maybe I need to become better at moving without one.",
  },
  {
    id: 'demo-entry-10',
    createdAt: '2026-07-28T07:55:00.000Z',
    topics: ['reflection', 'worries'],
    content:
      'I keep acting as if I first have to feel safe and only afterwards act. But perhaps many important decisions work the other way around: you act and safety, if it arrives, appears later. I wonder how long I have been optimizing a strategy whose secret goal is to eliminate an uncertainty that life does not intend to eliminate.',
  },
];

const DEMO_ENTRIES_ES = [
  {
    id: 'demo-entry-1',
    createdAt: '2026-08-02T18:10:00.000Z',
    topics: ['reflection', 'worries', 'work'],
    content:
      'Hoy cambiaron una reunión importante con muy poca antelación y sentí el impulso inmediato de reorganizar toda la semana. Hice tres listas distintas y abrí un documento para pensar escenarios posibles, pero al final la conversación ocurrió igual de rápido de lo que iba a ocurrir. Me doy cuenta de que muchas veces no estoy resolviendo el problema, sino intentando sentir que no me puede sorprender.',
  },
  {
    id: 'demo-entry-2',
    createdAt: '2026-08-01T20:25:00.000Z',
    topics: ['wisdom', 'reflection'],
    content:
      'Cada vez que algo queda ambiguo, mi reacción es construir estructura alrededor de esa ambigüedad. Lo llamo prudencia y responsabilidad, y en parte lo es, pero también es una forma elegante de no sentirme expuesto. Me cuesta admitir que a veces el orden es menos una herramienta y más un refugio.',
  },
  {
    id: 'demo-entry-3',
    createdAt: '2026-08-01T08:05:00.000Z',
    topics: ['work', 'worries'],
    content:
      'Pasé buena parte de la mañana investigando opciones para una decisión que, sinceramente, ya podía tomar con la información que tenía ayer. Seguí leyendo porque aprender me calma, pero hay un punto en el que investigar deja de aclarar y empieza a retrasar el momento de decidir. Quizá no estaba buscando comprensión, sino permiso para no moverme todavía.',
  },
  {
    id: 'demo-entry-4',
    createdAt: '2026-07-31T22:15:00.000Z',
    topics: ['interpersonal', 'reflection'],
    content:
      'Me sorprendió ver lo paciente que soy con la indecisión de otras personas. Puedo entender que alguien cambie de opinión, improvise y se equivoque. Sin embargo, cuando yo hago exactamente eso, la interpretación interna es mucho más dura: debería haberlo previsto, debería haber sabido más, debería haber diseñado un plan mejor.',
  },
  {
    id: 'demo-entry-5',
    createdAt: '2026-07-31T07:40:00.000Z',
    topics: ['wisdom', 'work'],
    content:
      'Hay una contradicción rara en mi relación con los planes. Digo que planificar me da libertad, pero muchas veces el plan termina diciéndome qué resultados me está permitido aceptar. En cuanto imagino quién debería ser dentro de tres meses, cualquier desviación empieza a sentirse como un fracaso moral en lugar de un ajuste normal.',
  },
  {
    id: 'demo-entry-6',
    createdAt: '2026-07-30T19:55:00.000Z',
    topics: ['reflection'],
    content:
      'Hoy tomé una decisión sin justificarla del todo y el mundo no se cayó. Fue extraño porque no tuve el ritual habitual de argumentos, matrices y escenarios. Simplemente elegí una dirección y seguí con el día. No sé todavía si fue la decisión correcta, pero descubrí que puedo tolerar no saberlo de inmediato.',
  },
  {
    id: 'demo-entry-7',
    createdAt: '2026-07-30T09:20:00.000Z',
    topics: ['worries', 'wisdom'],
    content:
      'Empiezo a sospechar que no siempre tengo miedo a equivocarme. A veces me inquieta más pensar que podría haber querido otra cosa, otra vida o incluso otra versión de mí. Ese tipo de incertidumbre no tiene solución técnica. No hay lista que responda por completo a quién debería haber sido.',
  },
  {
    id: 'demo-entry-8',
    createdAt: '2026-07-29T21:10:00.000Z',
    topics: ['work', 'interpersonal'],
    content:
      'Al final ocurrió justo lo que había estado intentando anticipar toda la semana, y la verdad es que mis horas de preparación no cambiaron demasiado el resultado. Lo inquietante es que mi conclusión espontánea no fue relajarme, sino pensar que la próxima vez debería prepararme mejor. Parece lógico, pero también parece una trampa.',
  },
  {
    id: 'demo-entry-9',
    createdAt: '2026-07-28T18:30:00.000Z',
    topics: ['wisdom', 'reflection', 'meditations'],
    content:
      "Maybe I don't need a better plan. Maybe I need to become better at moving without one.",
  },
  {
    id: 'demo-entry-10',
    createdAt: '2026-07-28T07:55:00.000Z',
    topics: ['reflection', 'worries'],
    content:
      'Sigo funcionando como si primero tuviera que sentirme seguro y solamente después actuar. Pero quizá muchas decisiones importantes funcionan al revés: actúas y la seguridad, si llega, aparece después. Me pregunto cuánto tiempo llevo optimizando una estrategia cuyo objetivo secreto es eliminar una incertidumbre que la vida no piensa eliminar.',
  },
];

const DEMO_QUOTA = {
  timezone: 'Europe/Madrid',
  limit: 2,
  used: 1,
  remaining: 1,
  resetsAt: '2026-08-02T22:00:00.000Z',
};

const DEMO_SUMMARY_EN = {
  mainTopics: ['Reflection', 'Wisdom', 'Worries'],
  summaryText:
    'There is something revealing in how you turn the need for control into a virtue. Across several entries the same sequence appears: something slips out of your hands, and your first reaction is to build a structure around the uncertainty. You make lists, define scenarios, prepare alternatives. You present it as prudence. As responsibility. As being prepared. But there is an uncomfortable question beneath all that order: how much of that preparation actually serves to solve problems, and how much serves to keep you from feeling exposed to them?\n\nWhat is interesting is that you yourself notice the limit. When what you were trying to anticipate finally happens, you discover that many of the hours spent preparing had not changed the result. Your conclusion, however, is not to reduce control, but to perfect it: prepare better, think earlier, leave fewer loose ends. That is a perfectly logical response if your goal is to avoid uncertainty. But perhaps that is precisely the problem. You are optimizing a strategy whose success depends on eliminating something life does not seem willing to eliminate.\n\nThere is a deeper contradiction in your relationship with plans. You say that planning gives you freedom because it lets you act with intention, but several of your reflections describe exactly the opposite: the plan starts as a tool and ends up becoming an obligation. Once you have decided who you should be in three months, any deviation starts to feel like failure. The structure that was supposed to give you freedom begins to dictate which results you are allowed to consider acceptable.\n\nAnd here something appears that does not seem accidental. When you talk about other people, you are much more tolerant of their improvisation. You can understand that someone changes their mind, that they are not clear about what they want, that they try something and get it wrong. You even consider those things signs of intelligence or flexibility. But when you apply the same criterion to yourself, the interpretation changes: you should have anticipated it. You should have known more. You should have had a better plan. Uncertainty is wisdom when you see it from the outside and negligence when you experience it from the inside.\n\nIt is also striking how you use knowledge as a safety mechanism. Every time a doubt appears, your impulse is to investigate. And learning is, of course, useful. But in your own words a difference appears between learning in order to understand and learning in order to be able to act. Sometimes you keep accumulating information even after you have enough to make a decision. At that point, research stops reducing uncertainty and simply delays the moment when you have to live with it.\n\nPerhaps that is why the most significant entry of the week is not the one in which you find the best solution, but the one in which you describe having made a decision without feeling that you needed to justify it completely. There is something almost strange in the tone: fewer arguments, fewer scenarios, less need to prove to yourself that the choice was correct. You simply decided. And afterwards you discovered that you could tolerate not yet knowing whether it had been the right decision.\n\nThat introduces a possibility the rest of your reflections barely consider: perhaps you do not need to turn uncertainty into certainty in order to move forward. Perhaps part of your obsession with preparing comes from a premise you have never questioned: that you first have to feel sufficiently safe and only afterwards act, when many important decisions work precisely the other way around. You act, and safety appears afterwards, if it appears.\n\nYour writing also reveals something more subtle. You do not seem afraid only of being wrong. You seem uncomfortable with the possibility of discovering that you could have chosen something different. Error can be corrected. The possibility of having wanted another life, another direction, or even another version of yourself is harder to fit into your systems because it has no technical solution. You cannot make a list that answers who you should have been.',
  bestQuote:
    "Maybe I don't need a better plan. Maybe I need to become better at moving without one.",
  socraticText:
    'If you recognize that much of your planning no longer changes what will happen, what are you actually trying to achieve when you keep planning: better decisions, or the feeling of being protected from the consequences of deciding?',
  machiavelliText:
    'You say you want to move forward, but you keep prioritizing a strategy that avoids exposing you to uncertainty. What position do you expect to gain if protecting yourself from deciding has become the real objective?',
};

const DEMO_SUMMARY_ES = {
  mainTopics: ['Reflexión', 'Sabiduría', 'Preocupaciones'],
  summaryText:
    'Hay algo revelador en cómo conviertes la necesidad de control en una virtud. En varias de tus entradas aparece la misma secuencia: algo escapa a tus manos, y tu primera reacción es construir una estructura alrededor de la incertidumbre. Haces listas, defines escenarios, preparas alternativas. Lo presentas como prudencia. Como responsabilidad. Como estar preparado. Pero hay una pregunta incómoda debajo de todo ese orden: ¿cuánto de esa preparación sirve realmente para resolver problemas y cuánto sirve para no sentirte expuesto a ellos?\n\nLo interesante es que tú mismo detectas el límite. Cuando finalmente ocurre aquello que estabas intentando anticipar, descubres que muchas de las horas dedicadas a prepararte no habían cambiado el resultado. Sin embargo, tu conclusión no es reducir el control, sino perfeccionarlo: preparar mejor, pensar antes, dejar menos cabos sueltos. Es una respuesta perfectamente lógica si tu objetivo es evitar la incertidumbre. Pero quizá ese sea precisamente el problema. Estás optimizando una estrategia cuyo éxito depende de eliminar algo que la vida no parece dispuesta a eliminar.\n\nHay una contradicción más profunda en tu relación con los planes. Dices que planificar te da libertad porque te permite actuar con intención, pero varias de tus reflexiones describen exactamente lo contrario: el plan empieza como herramienta y termina convirtiéndose en obligación. Una vez que has decidido quién deberías ser dentro de tres meses, cualquier desviación empieza a sentirse como fracaso. La estructura que debía darte libertad comienza a dictarte qué resultados tienes permiso para considerar aceptables.\n\nY aquí aparece algo que no parece accidental. Cuando hablas de otras personas, eres mucho más tolerante con su improvisación. Puedes entender que alguien cambie de opinión, que no tenga claro qué quiere, que pruebe algo y se equivoque. Incluso consideras esas cosas signos de inteligencia o flexibilidad. Pero cuando aplicas el mismo criterio a ti mismo, la interpretación cambia: tú deberías haberlo previsto. Tú deberías haber sabido más. Tú deberías haber tenido un plan mejor. La incertidumbre es sabiduría cuando la ves desde fuera y negligencia cuando la experimentas desde dentro.\n\nTambién llama la atención cómo utilizas el conocimiento como mecanismo de seguridad. Cada vez que aparece una duda, tu impulso es investigar. Y aprender es, por supuesto, útil. Pero en tus propias palabras aparece una diferencia entre aprender para comprender y aprender para poder actuar. A veces sigues acumulando información incluso después de tener suficiente para tomar una decisión. En ese punto, la investigación deja de reducir la incertidumbre y empieza simplemente a retrasar el momento en que tienes que convivir con ella.\n\nQuizá por eso la entrada más significativa de la semana no sea aquella en la que encuentras la mejor solución, sino aquella en la que describes haber tomado una decisión sin sentir que necesitabas justificarla completamente. Hay algo casi extraño en el tono: menos argumentos, menos escenarios, menos necesidad de demostrarte que la elección era correcta. Simplemente decidiste. Y después descubriste que podías tolerar no saber todavía si había sido la decisión correcta.\n\nEso introduce una posibilidad que el resto de tus reflexiones apenas considera: quizá no necesitas convertir la incertidumbre en certeza para poder avanzar. Quizá una parte de tu obsesión por prepararte nace de una premisa que nunca has cuestionado: que primero debes sentirte suficientemente seguro y solamente después actuar, cuando muchas decisiones importantes funcionan precisamente al revés. Actúas, y la seguridad aparece después, si aparece.\n\nTu escritura también deja ver algo más sutil. No parece que tengas miedo únicamente de equivocarte. Parece que te incomoda la posibilidad de descubrir que podrías haber elegido algo distinto. El error puede corregirse. La posibilidad de haber querido otra vida, otra dirección o incluso otra versión de ti mismo es más difícil de encajar en tus sistemas porque no tiene una solución técnica. No puedes hacer una lista que responda a quién deberías haber sido.',
  bestQuote:
    "Maybe I don't need a better plan. Maybe I need to become better at moving without one.",
  socraticText:
    'Si reconoces que gran parte de tu planificación ya no cambia lo que ocurrirá, ¿qué estás intentando conseguir realmente cuando sigues planificando: mejores decisiones o la sensación de estar protegido de las consecuencias de decidir?',
  machiavelliText:
    'Dices que quieres avanzar, pero sigues priorizando una estrategia que evita exponerte a la incertidumbre. ¿Qué posición esperas ganar si protegerte de decidir se ha convertido en el objetivo real?',
};

const buildSummaryPayload = (entries, summary) => ({
  weekStart: '2026-07-27',
  weekEnd: '2026-08-02',
  entryCount: entries.length,
  minEntries: 2,
  quota: DEMO_QUOTA,
  summary,
});

export const getDemoEntries = (locale) =>
  parseLocale(locale) === 'es' ? DEMO_ENTRIES_ES : DEMO_ENTRIES_EN;

export const getDemoSummaryPayload = (locale) =>
  parseLocale(locale) === 'es'
    ? buildSummaryPayload(DEMO_ENTRIES_ES, DEMO_SUMMARY_ES)
    : buildSummaryPayload(DEMO_ENTRIES_EN, DEMO_SUMMARY_EN);
