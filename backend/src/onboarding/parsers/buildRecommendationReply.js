/**
 * Builds recommendation copy based on clarity only.
 * @param { 'low' | 'medium' | 'high' } clarity
 * @returns { string }
 */

const CLOSING_PARAGRAPH = `Sea cual sea la recomendación, la decisión es tuya. Siempre te recomendaremos que leas la teoría primero para ganar contexto, pero si quieres ir directo al test para entender mejor tus pensamientos estresantes actuales, adelante.

Suerte en tu camino.`;

export function buildRecommendationReply(clarity) {
  switch (clarity) {
    case 'high':
      return `
Tu respuesta muestra un buen nivel de claridad y concreción.

En este punto, te beneficiarás más de hacer un test breve para entender mejor tus pensamientos estresantes actuales y observarlos con más precisión.

${CLOSING_PARAGRAPH}
`;
    case 'medium':
      return `
Tu respuesta tiene una claridad intermedia.

Te recomendamos revisar nuestra teoría introductoria para afinar la forma de observar y formular tus pensamientos, y luego hacer el test para entender mejor tus pensamientos estresantes actuales.

${CLOSING_PARAGRAPH}
`;
    case 'low':
    default:
      return `
Tu respuesta no demuestra demasiada claridad con respecto a tu potencial problema de pensamientos... Todavía.

Antes de hacer el test, te recomendamos empezar por nuestra teoría introductoria, donde afinamos la forma de observar y formular tus pensamientos con mayor precisión.

${CLOSING_PARAGRAPH}
`;
  }
}