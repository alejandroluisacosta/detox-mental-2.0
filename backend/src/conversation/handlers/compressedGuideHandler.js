// src/conversation/handlers/compressedGuideHandler.js
import { STATES } from "../conversationFlow.js";

const PLACEHOLDER_BY_TIME = {
  2: "Placeholder for 2 minutes. You will replace this later.",
  5: "Placeholder for 5 minutes. You will replace this later.",
  15: "Placeholder for 15 minutes. You will replace this later."
};

const CHALLENGE_PROMPT = `En Detox Mental valoramos la práctica, la experimentación. Creemos que la única forma de lidiar con tus pensamientos problemáticos es clarificándolos para luego trabajar en ellos eficientemente, teniendo el máximo impacto en el menor tiempo posible.

Somos también amantes de los desafíos, así que este es mi primer desafío para ti: ¿puedes describir tus PQAs (Pensamientos Que Atormentan) en solo una (1) frase?

Dame tu mejor respuesta y te diré qué camino es mejor para ti en este punto: una exploración más profunda de nuestros conceptos o nuestro programa de práctica estructurada.

Recuerda: una sola frase.

Tu turno.`;

export async function compressedGuideHandler({ session }) {
  const timeBudget = session.data.timeBudget ?? 5;
  const placeholder = PLACEHOLDER_BY_TIME[timeBudget] ?? PLACEHOLDER_BY_TIME[5];
  const openingPrompt = `Perfecto, aquí tienes un resumen de nuestra filosofía para que puedas leerlo en ${timeBudget} minutos.`;

  session.state = STATES.PQA_PROMPT;
  return {
    reply: [openingPrompt, placeholder, CHALLENGE_PROMPT].join("\n\n"),
    state: session.state
  };
}
