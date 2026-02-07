/**
 * Compressed guide content for the onboarding flow.
 * Guide texts live in compressedGuides/; this module wires them and the challenge prompt.
 */

import guide2min from "./compressedGuides/guide2min.js";
import guide5min from "./compressedGuides/guide5min.js";

const CHALLENGE_PROMPT = `En Detox Mental valoramos la práctica, la experimentación. Creemos que la única forma de lidiar con tus pensamientos problemáticos es clarificándolos para luego trabajar en ellos eficientemente, teniendo el máximo impacto en el menor tiempo posible.

Somos también amantes de los desafíos, así que este es mi primer desafío para ti: ¿puedes describir tus PQAs (Pensamientos Que Atormentan) en solo una (1) frase?

Dame tu mejor respuesta y te diré qué camino es mejor para ti en este punto: una exploración más profunda de nuestros conceptos o nuestro programa de práctica estructurada.

Recuerda: una sola frase.

Tu turno.`;

/**
 * Returns the compressed guide text for the given minutes.
 * Caller must pass normalized minutes (2 or 5).
 * @param { 2 | 5 } minutes
 * @returns { string }
 */
export function getCompressedGuide(minutes) {
  return minutes === 5 ? guide5min : guide2min;
}

export { CHALLENGE_PROMPT };
