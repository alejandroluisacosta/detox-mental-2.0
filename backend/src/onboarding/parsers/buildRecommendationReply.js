/**
 * Builds recommendation copy based on clarity only.
 * @param { 'low' | 'medium' | 'high' } clarity
 * @param { string } [locale]
 * @returns { string }
 */

import { pickLocalized } from "../../i18n/locale.js";

const CLOSING_PARAGRAPH = {
  es: `Sea cual sea la recomendación, la decisión es tuya. Siempre te recomendaremos que leas la teoría primero para ganar contexto, pero si quieres ir directo al test para entender mejor tus pensamientos estresantes actuales, adelante.

Suerte en tu camino.`,
  en: `Whatever the recommendation, the decision is yours. We will always recommend that you read the theory first to gain context, but if you want to go straight to the test to better understand your current stressful thoughts, go ahead.

Good luck on your path.`,
};

const REPLIES = {
  high: {
    es: `
Tu respuesta muestra un buen nivel de claridad y concreción.

En este punto, te beneficiarás más de hacer un test breve para entender mejor tus pensamientos estresantes actuales y observarlos con más precisión.

${CLOSING_PARAGRAPH.es}
`,
    en: `
Your answer shows a good level of clarity and concreteness.

At this point, you will benefit more from taking a short test to better understand your current stressful thoughts and observe them more precisely.

${CLOSING_PARAGRAPH.en}
`,
  },
  medium: {
    es: `
Tu respuesta tiene una claridad intermedia.

Te recomendamos revisar nuestra teoría introductoria para afinar la forma de observar y formular tus pensamientos, y luego hacer nuestro test para entender mejor tus pensamientos estresantes actuales.

${CLOSING_PARAGRAPH.es}
`,
    en: `
Your answer has an intermediate level of clarity.

We recommend reviewing our introductory theory to refine how you observe and phrase your thoughts, and then taking our test to better understand your current stressful thoughts.

${CLOSING_PARAGRAPH.en}
`,
  },
  low: {
    es: `
Tu respuesta no demuestra demasiada claridad con respecto a tu potencial problema de pensamientos... Todavía.

Antes de hacer nuestro test para entender mejor tus pensamientos estresantes actuales, te recomendamos empezar por nuestra teoría introductoria, donde afinamos la forma de observar y formular tus pensamientos con mayor precisión.

${CLOSING_PARAGRAPH.es}
`,
    en: `
Your answer does not show much clarity yet about your potential thought problem... Still.

Before taking our test to better understand your current stressful thoughts, we recommend starting with our introductory theory, where we refine how you observe and phrase your thoughts with more precision.

${CLOSING_PARAGRAPH.en}
`,
  },
};

export function buildRecommendationReply(clarity, locale) {
  const key = clarity === "high" || clarity === "medium" ? clarity : "low";
  return pickLocalized(REPLIES[key], locale);
}
