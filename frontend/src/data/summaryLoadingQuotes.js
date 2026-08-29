import { parseLocale } from '../utils/locale.js';

const quotesByLocale = {
  en: [
    'The unexamined life is not worth living.\n\n- Socrates.',
    'Know thyself.\n\n- Inscription at the Temple of Apollo in Delphi.',
    'We are reading your week slowly…',
    'What you wrote deserves to be seen again.',
    'The right question is sometimes worth more than the answer.',
  ],
  es: [
    'Una vida sin examinar no merece ser vivida.\n\n- Sócrates.',
    'Conócete a ti mismo.\n\n- Inscripción del templo de Apolo en Delfos.',
    'Estamos leyendo tu semana con calma…',
    'Lo que escribiste merece ser visto otra vez.',
    'La pregunta correcta a veces vale más que la respuesta.',
  ],
};

export const getSummaryLoadingQuotes = (locale) =>
  quotesByLocale[parseLocale(locale)];

export const getRandomSummaryLoadingQuote = (locale) => {
  const quotes = getSummaryLoadingQuotes(locale);
  return quotes[Math.floor(Math.random() * quotes.length)];
};
