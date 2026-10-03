import { pickLocalized } from "../../i18n/locale.js";
import { onboardingMessage } from "../../i18n/onboardingMessages.js";
import { STATES } from "../conversationFlow.js";
import {
  getCompressedGuide,
  COMPRESSED_GUIDE_INTRO,
  CTA_TITLE,
  CTA_PARAGRAPH,
  getCompressedGuideFullReply,
} from "../content/compressedGuide.js";

export async function compressedGuideHandler({ session, locale }) {
  const timeBudget = session.data.timeBudget;
  const effectiveMinutes = timeBudget === 5 ? 5 : 2;
  const guide = pickLocalized(getCompressedGuide(effectiveMinutes), locale);
  const wasIgnored = session.data.ignoredDuringTimeSelection === true;
  delete session.data.ignoredDuringTimeSelection;

  session.state = STATES.PQA_PROMPT;
  const introOnly = [guide, pickLocalized(COMPRESSED_GUIDE_INTRO, locale)].join("\n\n");
  const replyFull = [guide, getCompressedGuideFullReply(locale)].join("\n\n");
  const prefix = wasIgnored ? onboardingMessage("ignoredPrefix", locale) : "";
  return {
    reply: prefix + introOnly,
    replyFull: prefix + replyFull,
    ctaPrompt: {
      title: pickLocalized(CTA_TITLE, locale),
      paragraph: pickLocalized(CTA_PARAGRAPH, locale),
    },
  };
}
