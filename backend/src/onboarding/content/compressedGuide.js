/**
 * Compressed guide content for the onboarding flow.
 * Guide texts live in compressedGuides/; this module wires them and the challenge prompt.
 */

import { pickLocalized } from "../../i18n/locale.js";
import guide2min from "./compressedGuides/guide2min.js";
import guide5min from "./compressedGuides/guide5min.js";

/** Intro only (shown in message bubble when CTA is in input box). */
export const COMPRESSED_GUIDE_INTRO = {
  es: `En Detox Mental valoramos la práctica, la experimentación. Creemos que la única forma de lidiar con tus pensamientos problemáticos es clarificándolos para luego trabajar en ellos eficientemente, teniendo el máximo impacto en el menor tiempo posible.

Somos también amantes de los desafíos, así que este es mi primer desafío para ti:`,
  en: `At Detox Mental we value practice and experimentation. We believe the only way to deal with your problematic thoughts is to clarify them and then work on them efficiently, with the greatest impact in the least time possible.

We are also fans of challenges, so this is my first challenge for you:`,
};

/** CTA title shown in the input-section box (imperative). */
export const CTA_TITLE = {
  es: "Describe los pensamientos que te atormentan en solo una (1) frase.",
  en: "Describe the thoughts that torment you in just one (1) sentence.",
};

/** CTA paragraph shown below the title in the input-section box. */
export const CTA_PARAGRAPH = {
  es: "Dame tu mejor respuesta y te diré qué camino es mejor para ti en este punto.",
  en: "Give me your best answer and I will tell you which path is better for you at this point.",
};

/** Full CTA block for the message after the user responds (markdown). */
export const CHALLENGE_PROMPT = {
  es: `¿Puedes describir tus **PQAs (Pensamientos Que Atormentan)** en solo una (1) frase?

${CTA_PARAGRAPH.es}`,
  en: `Can you describe your **tormenting thoughts** in just one (1) sentence?

${CTA_PARAGRAPH.en}`,
};

/**
 * Returns the compressed guide text for the given minutes.
 * Caller must pass normalized minutes (2 or 5).
 * @param { 2 | 5 } minutes
 * @returns {{ es: string, en: string }}
 */
export function getCompressedGuide(minutes) {
  return minutes === 5 ? guide5min : guide2min;
}

/** Full assistant message (intro + CTA) once the user has responded. */
export function getCompressedGuideFullReply(locale) {
  return [
    pickLocalized(COMPRESSED_GUIDE_INTRO, locale),
    pickLocalized(CHALLENGE_PROMPT, locale),
  ].join("\n\n");
}
