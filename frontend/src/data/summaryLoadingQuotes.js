export const summaryLoadingQuotes = [
  'Una vida sin examinar no merece ser vivida.\n\n- Sócrates.',
  'Conócete a ti mismo.\n\n- Inscripción del templo de Apolo en Delfos.',
  'Estamos leyendo tu semana con calma…',
  'Lo que escribiste merece ser visto otra vez.',
  'La pregunta correcta a veces vale más que la respuesta.',
];

export const getRandomSummaryLoadingQuote = () =>
  summaryLoadingQuotes[
    Math.floor(Math.random() * summaryLoadingQuotes.length)
  ];
