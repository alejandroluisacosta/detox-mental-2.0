/**
 * Builds recommendation copy based on clarity only.
 * @param { 'low' | 'medium' | 'high' } clarity
 * @returns { string }
 */
export function buildRecommendationReply(clarity) {
  switch (clarity) {
    case 'high':
      return `
Tu respuesta muestra un buen nivel de claridad y concreción.

En este punto, te beneficiarás más de nuestro programa de práctica estructurada, donde trabajamos directamente con pensamientos como el que acabas de describir.
`;
    case 'medium':
      return `
Tu respuesta tiene una claridad intermedia.

Te recomendamos revisar nuestro artículo introductorio para afinar la forma de observar y formular tus pensamientos, y luego explorar el programa de práctica estructurada.
`;
    case 'low':
    default:
      return `
Tu respuesta es válida, pero todavía es algo general.

Antes de entrar en práctica intensiva, te recomendamos empezar por nuestro artículo introductorio, donde afinamos la forma de observar y formular tus pensamientos con mayor precisión.
`;
  }
}