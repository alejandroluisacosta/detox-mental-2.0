import { STATES } from "../conversationFlow.js";
import { getCompressedGuide, CHALLENGE_PROMPT } from "../../content/compressedGuide.js";

export async function compressedGuideHandler({ session }) {
  const timeBudget = session.data.timeBudget;
  const effectiveMinutes = timeBudget === 5 ? 5 : 2;
  const guide = getCompressedGuide(effectiveMinutes);
  const wasIgnored = session.data.ignoredDuringTimeSelection === true;
  delete session.data.ignoredDuringTimeSelection;

  session.state = STATES.PQA_PROMPT;
  const content = [guide, CHALLENGE_PROMPT].join("\n\n");
  return {
    reply: wasIgnored ? `Vaya joya.\n\n${content}` : content,
    state: session.state
  };
}
