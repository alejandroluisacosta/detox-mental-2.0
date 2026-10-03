import { pickLocalized } from "../../i18n/locale.js";
import { onboardingMessage } from "../../i18n/onboardingMessages.js";
import { STATES } from "../conversationFlow.js";
import {
  CHALLENGE_CHIP_ID,
  CHALLENGE_CHIP_LABEL,
  CHALLENGE_PROMPT_LABEL,
  FAQ_ENTRIES,
  FAQ_INTRO,
  FOLLOW_UP_QUESTION,
  getFaqById,
} from "../content/faq.js";
import { timeSelectionHandler } from "./timeSelectionHandler.js";

function buildFaqChips(session, locale) {
  const answered = new Set(session.data.answeredFaqIds ?? []);
  return FAQ_ENTRIES.filter((e) => !answered.has(e.id)).map((e) => ({
    id: e.id,
    label: pickLocalized(e.label, locale),
  }));
}

function faqHubUi(session, locale) {
  return {
    faqChips: buildFaqChips(session, locale),
    challengeChip: {
      id: CHALLENGE_CHIP_ID,
      label: pickLocalized(CHALLENGE_CHIP_LABEL, locale),
    },
    challengePromptLabel: pickLocalized(CHALLENGE_PROMPT_LABEL, locale),
  };
}

export async function faqHubHandler({ session, message, chipId, locale }) {
  const challengeSelected = chipId === CHALLENGE_CHIP_ID;
  if (challengeSelected) {
    delete session.data.answeredFaqIds;
    session.state = STATES.TIME_SELECTION;
    return timeSelectionHandler({ session, message: "", locale });
  }

  const hasChip = typeof chipId === "string" && chipId.length > 0;
  const trimmedMsg = (message ?? "").trim();

  if (!hasChip && !trimmedMsg) {
    const reply = `${pickLocalized(FAQ_INTRO, locale)}\n\n${pickLocalized(FOLLOW_UP_QUESTION, locale)}`;
    return {
      reply,
      state: session.state,
      ...faqHubUi(session, locale),
    };
  }

  if (hasChip) {
    const entry = getFaqById(chipId);
    if (!entry) {
      return {
        reply: onboardingMessage("unknownChip", locale),
        state: session.state,
        ...faqHubUi(session, locale),
      };
    }
    const answered = session.data.answeredFaqIds ?? [];
    if (!answered.includes(chipId)) {
      session.data.answeredFaqIds = [...answered, chipId];
    }
    const reply = `${pickLocalized(entry.markdownBody, locale)}\n\n${pickLocalized(FOLLOW_UP_QUESTION, locale)}`;
    return {
      reply,
      state: session.state,
      ...faqHubUi(session, locale),
    };
  }

  if (trimmedMsg) {
    return {
      reply: onboardingMessage("chooseOption", locale),
      state: session.state,
      ...faqHubUi(session, locale),
    };
  }

  const reply = `${pickLocalized(FAQ_INTRO, locale)}\n\n${pickLocalized(FOLLOW_UP_QUESTION, locale)}`;
  return {
    reply,
    state: session.state,
    ...faqHubUi(session, locale),
  };
}
