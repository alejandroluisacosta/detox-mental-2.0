/**
 * Builds recommendation copy based on clarity only.
 * @param { 'low' | 'medium' | 'high' } clarity
 * @returns { string }
 */

const CLOSING_PARAGRAPH = `Sea cual sea la recomendación, la decisión es tuya. Siempre te recomendarremos que leas el artículo primero para ganar contexto, pero si quieres ir directo al curso, adelante.

Suerte en tu camino.`;

export function buildRecommendationReply(clarity) {
  switch (clarity) {
    case 'high':
      return `
Tu respuesta muestra un buen nivel de claridad y concreción.

En este punto, te beneficiarás más de nuestro programa de práctica estructurada, donde trabajamos directamente con pensamientos como el que acabas de describir.

${CLOSING_PARAGRAPH}
`;
    case 'medium':
      return `
Tu respuesta tiene una claridad intermedia.

Te recomendamos revisar nuestro artículo introductorio para afinar la forma de observar y formular tus pensamientos, y luego explorar el programa de práctica estructurada.

${CLOSING_PARAGRAPH}
`;
    case 'low':
    default:
      return `
Tu respuesta no demuestra demasiada claridad con respecto a tu potencial problema de pensamientos... Todavía.

Antes de entrar en práctica intensiva, te recomendamos empezar por nuestro artículo introductorio, donde afinamos la forma de observar y formular tus pensamientos con mayor precisión.

${CLOSING_PARAGRAPH}
`;
  }
}