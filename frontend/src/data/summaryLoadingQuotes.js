import { parseLocale } from '../utils/locale.js';

const quotesByLocale = {
  en: [
    'The unexamined life is not worth living.\n\n- Socrates.',
    'Know thyself.\n\n- Inscription at the Temple of Apollo in Delphi.',
    'We are reading your week slowly…',
    'What you wrote deserves to be seen again.',
    'The right question is sometimes worth more than the answer.',
    'Wonder is the beginning of wisdom.\n\n- Socrates.',
    'No one steps in the same river twice.\n\n- Heraclitus.',
    'The soul becomes dyed with the colour of its thoughts.\n\n- Marcus Aurelius.',
    'An honest sentence is already a kind of courage.',
    'Slow looking is how the pattern shows itself.',
    'Your week is becoming a mirror.',
  ],
  es: [
    'Una vida sin examinar no merece ser vivida.\n\n- Sócrates.',
    'Conócete a ti mismo.\n\n- Inscripción del templo de Apolo en Delfos.',
    'Estamos leyendo tu semana con calma…',
    'Lo que escribiste merece ser visto otra vez.',
    'La pregunta correcta a veces vale más que la respuesta.',
    'El asombro es el principio de la sabiduría.\n\n- Sócrates.',
    'Nadie se baña dos veces en el mismo río.\n\n- Heráclito.',
    'El alma se tiñe del color de sus pensamientos.\n\n- Marco Aurelio.',
    'Una frase honesta ya es una forma de valor.',
    'Mirar despacio es cómo aparece el patrón.',
    'Tu semana se está convirtiendo en un espejo.',
  ],
};

export const getSummaryLoadingQuotes = (locale) =>
  quotesByLocale[parseLocale(locale)];

export const pickDistinctQuotes = (locale, count, random = Math.random) => {
  const quotes = [...getSummaryLoadingQuotes(locale)];
  for (let i = quotes.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [quotes[i], quotes[j]] = [quotes[j], quotes[i]];
  }
  return quotes.slice(0, Math.min(count, quotes.length));
};

export const getRandomSummaryLoadingQuote = (locale) => {
  const quotes = getSummaryLoadingQuotes(locale);
  return quotes[Math.floor(Math.random() * quotes.length)];
};
