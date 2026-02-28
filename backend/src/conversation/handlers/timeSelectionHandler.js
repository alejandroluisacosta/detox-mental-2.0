import { STATES } from "../conversationFlow.js";
import { parseTimeSelection } from "../../parsers/parseTimeSelection.js"

export async function timeSelectionHandler({ session, message }) {
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
  `,
        state: session.state,
      };
  }

  // User replied → parse
  const minutes = parseTimeSelection(message);

  if (!minutes) {
    const attempts = (session.data.timeSelectionAttempts ?? 0);
    session.data.timeSelectionAttempts = attempts + 1;

    const invalidReplies = [
      "Por favor, responde con 2 o 5 minutos.",
      "Por favor, dos o cinco minutos.",
      "POR FAVOR, dos o cinco minutos.",
      "¿Es en serio? 2 o 5.",
      "2 o 5.",
      "2 o 5.",
      "2 o 5 por favor.",
      "2 o 5, POR FAVOR.",
      "Por Zeus. ¿Prefieres dos o cinco minutos? Ya habrías terminado.",
      "Ya sabes lo que ofrezco. A partir de aquí te ignoro hasta que aclares si prefieres 2 o 5 minutos.",
    ];
    const reply = attempts >= invalidReplies.length
      ? "Ignorándote."
      : invalidReplies[attempts];

    return {
      reply,
      state: session.state
    };
  }

  // Valid → transition
  session.state = STATES.COMPRESSED_GUIDE;
  session.data.timeBudget = minutes;
  delete session.data.timeSelectionAttempts;
  return {
    reply: null,
    state: session.state
  };
}
