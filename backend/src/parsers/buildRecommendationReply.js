export function buildRecommendationReply(recommendation) {
  if (recommendation === 'COURSE') {
    return `
Tu respuesta muestra un buen nivel de claridad y concreción.

En este punto, te beneficiarás más de nuestro programa de práctica estructurada, donde trabajamos directamente con pensamientos como el que acabas de describir.
`;
  }

  return `
Tu respuesta es válida, pero todavía es algo general.

Antes de entrar en práctica intensiva, te recomendamos empezar por nuestro artículo introductorio, donde afinamos la forma de observar y formular tus pensamientos con mayor precisión.
`;
}