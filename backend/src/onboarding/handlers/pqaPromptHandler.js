import { onboardingMessage } from "../../i18n/onboardingMessages.js";
import { isSingleSentence } from "../parsers/isSingleSentence.js";
import { STATES } from "../conversationFlow.js";

export async function pqaPromptHandler({ session, message, locale }) {
  if (!isSingleSentence(message)) {
    return {
      reply: onboardingMessage("pqaSingleSentence", locale),
      state: session.state,
    };
  }

  session.data.pqaSentence = message.trim();

  session.state = STATES.PQA_CHALLENGE;

  return {
    reply: null,
    state: session.state,
  };
}
