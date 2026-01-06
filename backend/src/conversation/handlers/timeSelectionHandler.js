import { STATES } from "../conversationFlow.js";
import { timeSelectionPrompt } from "../../prompts/timeSelectionPrompt.js";
import { parseTimeSelection } from "../../parsers/parseTimeSelection.js"

export async function timeSelectionHandler({ client, session, message }) {
  // No user input yet → open the conversation
  if (!message) {
      return {
        reply: `
  Bienvenido/a a Detox Mental, tu gimnasio mental virtual.

  Yo soy Tales, tu guía al inicio de este proceso.
  Para empezar, ¿cuánto tiempo puedes dedicar ahora mismo?

  Responde con una sola opción:
  - 2 minutos
  - 5 minutos
  - 15 minutos
  `,
        state: session.state,
      };
  }

  // User replied → parse
  const minutes = parseTimeSelection(message);

  if (!minutes) {
    return {
      reply: "Por favor, responde con 2, 5 o 15 minutos.",
      state: session.state
    };
  }

  // Valid → transition
  session.state = STATES.COMPRESSED_GUIDE;
  session.data.timeBudget = minutes;

  return {
    reply: "Perfecto. Continuemos.",
    state: session.state
  };
}
