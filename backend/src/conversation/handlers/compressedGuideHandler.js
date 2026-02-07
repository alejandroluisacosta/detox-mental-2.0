// src/conversation/handlers/compressedGuideHandler.js
import { STATES } from "../conversationFlow.js";
import { getCompressedGuide, CHALLENGE_PROMPT } from "../../content/compressedGuide.js";

export async function compressedGuideHandler({ session }) {
  const timeBudget = session.data.timeBudget;
  const effectiveMinutes = timeBudget === 5 ? 5 : 2;
  const guide = getCompressedGuide(timeBudget);
  const openingPrompt = `Perfecto, aquí tienes un resumen de nuestra filosofía para que puedas leerlo en ${effectiveMinutes} minutos.`;

  session.state = STATES.PQA_PROMPT;
  return {
    reply: [openingPrompt, guide, CHALLENGE_PROMPT].join("\n\n"),
    state: session.state
  };
}
