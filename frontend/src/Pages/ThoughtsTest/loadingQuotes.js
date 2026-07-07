// Reflective sentences shown while a test loads. One is picked at random per
// appearance of the loading screen. Newlines separate the quote from its author
// and are rendered via `white-space: pre-line`.
export const loadingQuotes = [
  "Una vida sin examinar no merece ser vivida.\n\n- Sócrates.",
  "Pienso, luego existo.\n\n- René Descartes.",
  "¿Ya escribiste hoy?",
  "Escribir lo que te pasa por la mente te alivia momentáneamente.",
  "La perfección se alcanza no cuando no hay nada más que añadir, sino cuando no hay nada más que quitar. \n\n- Antoine de Saint-Exupéry.",
];

export const getRandomLoadingQuote = () =>
  loadingQuotes[Math.floor(Math.random() * loadingQuotes.length)];

export const journalAcknowledgments = [
  "Me alegra que hayas podido escribir sobre esto. Espero que te haya ayudado.",
  "Bien, espero que escribir sobre el tema te haya ayudado a liberar un poco de estrés.",
  "Escribir es mágico. Espero que te haya ayudado.",
  "Qué bueno que te animaste a escribir. Un paso al frente para tu salud mental.",
];

export const getRandomJournalAcknowledgment = () =>
  journalAcknowledgments[Math.floor(Math.random() * journalAcknowledgments.length)];
