import { isSingleSentence } from "../../parsers/isSingleSentence.js";
import { STATES } from "../conversationFlow.js";

export async function pqaPromptHandler({ session, message }) {
  if (!isSingleSentence(message)) {
    return {
      reply: `Recuerda: una sola frase. Inténtalo de nuevo.`,
      state: session.state
    };
  }

  session.data.pqaSentence = message.trim();

  session.state = STATES.PQA_CHALLENGE;

  return {
    reply: null,
    state: session.state
  };
}