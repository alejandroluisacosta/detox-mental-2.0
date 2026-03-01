/**
 * Compressed guide content for the onboarding flow.
 * Guide texts live in compressedGuides/; this module wires them and the challenge prompt.
 */

import guide2min from "./compressedGuides/guide2min.js";
import guide5min from "./compressedGuides/guide5min.js";

/** Intro only (shown in message bubble when CTA is in input box). */
export const COMPRESSED_GUIDE_INTRO = `En Detox Mental valoramos la práctica, la experimentación. Creemos que la única forma de lidiar con tus pensamientos problemáticos es clarificándolos para luego trabajar en ellos eficientemente, teniendo el máximo impacto en el menor tiempo posible.

Somos también amantes de los desafíos, así que este es mi primer desafío para ti:`;

/** CTA title shown in the input-section box (imperative). */
export const CTA_TITLE = "Describe los pensamientos que te atormentan en solo una (1) frase.";

/** CTA paragraph shown below the title in the input-section box. */
export const CTA_PARAGRAPH = "Dame tu mejor respuesta y te diré qué camino es mejor para ti en este punto.";

/** Full CTA block for the message after the user responds (markdown). */
const CHALLENGE_PROMPT = `¿Puedes describir tus **PQAs (Pensamientos Que Atormentan)** en solo una (1) frase?

${CTA_PARAGRAPH}`;

/**
 * Returns the compressed guide text for the given minutes.
 * Caller must pass normalized minutes (2 or 5).
 * @param { 2 | 5 } minutes
 * @returns { string }
 */
export function getCompressedGuide(minutes) {
  return minutes === 5 ? guide5min : guide2min;
}

/** Full assistant message (intro + CTA) once the user has responded. */
export function getCompressedGuideFullReply() {
  return [COMPRESSED_GUIDE_INTRO, CHALLENGE_PROMPT].join("\n\n");
}

export { CHALLENGE_PROMPT };
