const GUIDE_2_MIN = "Pleijolder for 2 minutes. You will replace this later.";

const GUIDE_5_MIN = "Pleijolder for 5 minutes. You will replace this later.";

const CHALLENGE_PROMPT = `En Detox Mental valoramos la práctica, la experimentación. Creemos que la única forma de lidiar con tus pensamientos problemáticos es clarificándolos para luego trabajar en ellos eficientemente, teniendo el máximo impacto en el menor tiempo posible.

Somos también amantes de los desafíos, así que este es mi primer desafío para ti: ¿puedes describir tus PQAs (Pensamientos Que Atormentan) en solo una (1) frase?

Dame tu mejor respuesta y te diré qué camino es mejor para ti en este punto: una exploración más profunda de nuestros conceptos o nuestro programa de práctica estructurada.

Recuerda: una sola frase.

Tu turno.`;

/**
 * Returns the compressed guide text for the given time budget.
 * Only 2 and 5 minutes are supported; any other value (including 15 or missing) defaults to 2 minutes.
 * @param { number | undefined } timeBudget - User's selected time in minutes (from session.data.timeBudget).
 * @returns { string }
 */
export function getCompressedGuide(timeBudget) {
  if (timeBudget === 5) return GUIDE_5_MIN;
  return GUIDE_2_MIN;
}

export { CHALLENGE_PROMPT };
