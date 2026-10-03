import { pickLocalized } from './locale.js';

export const onboardingMessages = {
  unknownChip: {
    es: 'No reconozco esa opción. Elige una de las tarjetas de abajo.',
    en: 'I do not recognize that option. Choose one of the cards below.',
  },
  chooseOption: {
    es: 'Por favor, elige una de las opciones disponibles abajo.',
    en: 'Please choose one of the options available below.',
  },
  timeSelectionPrompt: {
    es: `
  Bien, directo a la acción.
  
  Antes de hacer el ejercicio, te voy a resumir la filosofía de Detox Mental. ¿Quieres la versión de 2 o 5 minutos?

  Responde con una sola opción:
  
  - 2 minutos
  - 5 minutos
  `,
    en: `
  All right, straight to action.
  
  Before we do the exercise, I am going to summarize the Detox Mental philosophy. Do you want the 2-minute or the 5-minute version?

  Reply with a single option:
  
  - 2 minutes
  - 5 minutes
  `,
  },
  timeSelectionInvalid: {
    es: [
      'Por favor, responde con 2 o 5 minutos.',
      'Por favor, dos o cinco minutos.',
      'POR FAVOR, dos o cinco minutos.',
      '¿Es en serio? 2 o 5.',
      '2 o 5.',
      '2 o 5.',
      '2 o 5 por favor.',
      '2 o 5, POR FAVOR.',
      'Por Zeus. ¿Prefieres dos o cinco minutos? Ya habrías terminado.',
      'Ya sabes lo que ofrezco. A partir de aquí te ignoro hasta que aclares si prefieres 2 o 5 minutos.',
    ],
    en: [
      'Please reply with 2 or 5 minutes.',
      'Please, two or five minutes.',
      'PLEASE, two or five minutes.',
      'Are you serious? 2 or 5.',
      '2 or 5.',
      '2 or 5.',
      '2 or 5 please.',
      '2 or 5, PLEASE.',
      'By Zeus. Do you prefer two or five minutes? You would have been done by now.',
      'You already know what I offer. From here on I will ignore you until you say whether you prefer 2 or 5 minutes.',
    ],
  },
  ignoring: {
    es: 'Ignorándote.',
    en: 'Ignoring you.',
  },
  ignoredPrefix: {
    es: 'Vaya joya.\n\n',
    en: 'What a gem.\n\n',
  },
  pqaSingleSentence: {
    es: 'Recuerda: una sola frase. Inténtalo de nuevo.',
    en: 'Remember: a single sentence. Try again.',
  },
  pqaMissingSentence: {
    es: 'Por favor, describe tu pensamiento en una sola frase.',
    en: 'Please describe your thought in a single sentence.',
  },
  pqaChallengeFallback: {
    es: '¿Qué te hace pensar eso?',
    en: 'What makes you think that?',
  },
  exitReply: {
    es: 'Ya tienes orientación para seguir. Usa los botones de arriba para ir a la teoría o al test.',
    en: 'You already have guidance for what comes next. Use the buttons above to go to the theory or the test.',
  },
};

export const onboardingMessage = (key, locale) =>
  pickLocalized(onboardingMessages[key], locale);
