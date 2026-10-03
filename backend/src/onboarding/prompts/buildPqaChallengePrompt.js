import { parseLocale } from "../../i18n/locale.js";

const LANGUAGE_RULES = {
  en: {
    outputLanguage: "English",
    addressForm: '"you"',
    examples: '"What makes you feel that way?" or "What leads you to think that?"',
  },
  es: {
    outputLanguage: "Spanish",
    addressForm: '"tú"',
    examples: '"¿Qué te hace sentir así?" or "¿Qué te lleva a pensar eso?"',
  },
};

export function buildPqaChallengeMessages(pqaSentence, locale) {
  const rules = LANGUAGE_RULES[parseLocale(locale)];
  return [
    {
      role: "user",
      content: `A user just shared this thought with you: "${pqaSentence}"

Your task: generate a single follow-up question that you will ask the user to help them expand or question this thought. The question must be directed at the user (second person: ${rules.addressForm}), not at yourself. It should invite reflection, curiosity, or gentle challenge.

Examples of correct form: ${rules.examples} — the question is for the user to answer, so it must address them, not you.

Respond only with the question, written in ${rules.outputLanguage}. Do not reply in any other language.`,
    },
  ];
}
