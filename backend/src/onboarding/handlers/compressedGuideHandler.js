import { STATES } from "../conversationFlow.js";
import {
  getCompressedGuide,
  COMPRESSED_GUIDE_INTRO,
  CTA_TITLE,
  CTA_PARAGRAPH,
  getCompressedGuideFullReply,
} from "../content/compressedGuide.js";

export async function compressedGuideHandler({ session }) {
  const timeBudget = session.data.timeBudget;
  const effectiveMinutes = timeBudget === 5 ? 5 : 2;
  const guide = getCompressedGuide(effectiveMinutes);
  const wasIgnored = session.data.ignoredDuringTimeSelection === true;
  delete session.data.ignoredDuringTimeSelection;

  session.state = STATES.PQA_PROMPT;
  const introOnly = [guide, COMPRESSED_GUIDE_INTRO].join("\n\n");
  const replyFull = [guide, getCompressedGuideFullReply()].join("\n\n");
  const prefix = wasIgnored ? "Vaya joya.\n\n" : "";
  return {
    reply: prefix + introOnly,
    replyFull: prefix + replyFull,
    ctaPrompt: { title: CTA_TITLE, paragraph: CTA_PARAGRAPH },
  };
}
