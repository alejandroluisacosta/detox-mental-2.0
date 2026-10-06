import { toAnswerList } from '../../utils/exerciseAnswers.js';
import { DEFAULT_LOCALE, parseLocale } from '../../utils/locale.js';
import { sessionsCopy as enSessionsCopy } from './en/sessions.js';
import { journalAcknowledgments as enJournalAcknowledgments, loadingQuotes as enLoadingQuotes, testsCopy as enTestsCopy } from './en/tests.js';
import { theory as enTheory } from './en/theory.jsx';
import { sessionsCopy as esSessionsCopy } from './es/sessions.js';
import { journalAcknowledgments as esJournalAcknowledgments, loadingQuotes as esLoadingQuotes, testsCopy as esTestsCopy } from './es/tests.js';
import { theory as esTheory } from './es/theory.jsx';
import { pickLocalized, resolveOverlay } from './fallback.js';
import { sessionsMeta } from './shared/sessionsMeta.js';
import { testIds, testRouting } from './shared/testsMeta.js';

const sessionOverlays = {
  es: esSessionsCopy,
  en: enSessionsCopy,
};

const testOverlays = {
  es: esTestsCopy,
  en: enTestsCopy,
};

const testQuoteOverlays = {
  es: { loadingQuotes: esLoadingQuotes, journalAcknowledgments: esJournalAcknowledgments },
  en: { loadingQuotes: enLoadingQuotes, journalAcknowledgments: enJournalAcknowledgments },
};

const theoryOverlays = {
  es: esTheory,
  en: enTheory,
};

const mergeExercise = (sourceExercise = {}, overlayExercise = {}, exerciseIsBlocked) => ({
  question: pickLocalized(sourceExercise, overlayExercise, 'question'),
  answers: toAnswerList(
    pickLocalized(sourceExercise, overlayExercise, 'answers') ?? sourceExercise.answers,
  ),
  text: pickLocalized(sourceExercise, overlayExercise, 'text'),
  isBlocked: exerciseIsBlocked,
});

export const getSessions = (locale = DEFAULT_LOCALE) => {
  const overlay = resolveOverlay(locale, sessionOverlays);
  return sessionsMeta.map((meta) => {
    const source = esSessionsCopy[meta.id];
    const localeCopy = overlay[meta.id] ?? {};
    return {
      id: meta.id,
      img: meta.img,
      isBlocked: meta.isBlocked,
      title: pickLocalized(source, localeCopy, 'title'),
      description: pickLocalized(source, localeCopy, 'description'),
      unblockQuestion: Object.hasOwn(localeCopy, 'unblockQuestion')
        ? localeCopy.unblockQuestion
        : source.unblockQuestion,
      exercise: mergeExercise(source.exercise, localeCopy.exercise, meta.exerciseIsBlocked),
    };
  });
};

const mergeQuestions = (sourceQuestions = [], overlayQuestions) => {
  if (!Array.isArray(overlayQuestions) || overlayQuestions.length === 0) {
    return sourceQuestions;
  }
  return sourceQuestions.map((question, index) => {
    const overlayQuestion = overlayQuestions[index] ?? {};
    const overlayOptions = overlayQuestion.options;
    return {
      ...question,
      prompt: pickLocalized(question, overlayQuestion, 'prompt'),
      options: Array.isArray(overlayOptions) && overlayOptions.length > 0
        ? question.options.map((option, optionIndex) => ({
            ...option,
            label: pickLocalized(option, overlayOptions[optionIndex] ?? {}, 'label'),
          }))
        : question.options,
    };
  });
};

export const getTests = (locale = DEFAULT_LOCALE) => {
  const overlay = resolveOverlay(locale, testOverlays);
  return Object.fromEntries(
    testIds.map((id) => {
      const source = esTestsCopy[id];
      const localeCopy = overlay[id] ?? {};
      const routing = testRouting[id];
      const recommendationMessage = pickLocalized(
        { recommendationMessage: source.recommendationMessage },
        localeCopy,
        'recommendationMessage',
      );
      return [
        id,
        {
          id,
          title: pickLocalized(source, localeCopy, 'title'),
          intro: pickLocalized(source, localeCopy, 'intro'),
          questions: mergeQuestions(source.questions, localeCopy.questions),
          coursePromo: {
            title: pickLocalized(source.coursePromo, localeCopy.coursePromo ?? {}, 'title'),
            paragraph: pickLocalized(source.coursePromo, localeCopy.coursePromo ?? {}, 'paragraph'),
            buttonLabel: pickLocalized(source.coursePromo, localeCopy.coursePromo ?? {}, 'buttonLabel'),
          },
          journalingPrompt: pickLocalized(source, localeCopy, 'journalingPrompt'),
          recommendation: routing
            ? {
                keyQuestionId: routing.keyQuestionId,
                byOption: routing.byOption,
                message: recommendationMessage,
              }
            : undefined,
        },
      ];
    }),
  );
};

export const getTestExtras = (locale = DEFAULT_LOCALE) => {
  const overlay = resolveOverlay(locale, testQuoteOverlays);
  return {
    loadingQuotes: pickLocalized(testQuoteOverlays.es, overlay, 'loadingQuotes'),
    journalAcknowledgments: pickLocalized(
      testQuoteOverlays.es,
      overlay,
      'journalAcknowledgments',
    ),
  };
};

export const getTheory = (locale = DEFAULT_LOCALE) => {
  const overlay = resolveOverlay(locale, theoryOverlays);
  return {
    title: pickLocalized(esTheory, overlay, 'title'),
    subtitle: pickLocalized(esTheory, overlay, 'subtitle'),
    writtenBy: pickLocalized(esTheory, overlay, 'writtenBy'),
    Body: pickLocalized(esTheory, overlay, 'Body'),
    wantMoreTitle: pickLocalized(esTheory, overlay, 'wantMoreTitle'),
    WantMore: pickLocalized(esTheory, overlay, 'WantMore'),
  };
};

export const getSessionAudioSrc = (sessionId, locale = DEFAULT_LOCALE) => {
  // English audio is a later phase. Keep the Spanish file for every locale.
  void parseLocale(locale);
  return `/session_${sessionId}.mp3`;
};

export { sessionsMeta, testIds, testRouting };
