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

function buildFaqChips(session) {
  const answered = new Set(session.data.answeredFaqIds ?? []);
  return FAQ_ENTRIES.filter((e) => !answered.has(e.id)).map((e) => ({
    id: e.id,
    label: e.label,
  }));
}

function faqHubUi(session) {
  return {
    faqChips: buildFaqChips(session),
    challengeChip: { id: CHALLENGE_CHIP_ID, label: CHALLENGE_CHIP_LABEL },
    challengePromptLabel: CHALLENGE_PROMPT_LABEL,
  };
}

export async function faqHubHandler({ session, message, chipId }) {
  const challengeSelected = chipId === CHALLENGE_CHIP_ID;
  if (challengeSelected) {
    delete session.data.answeredFaqIds;
    session.state = STATES.TIME_SELECTION;
    return timeSelectionHandler({ session, message: "" });
  }

  const hasChip = typeof chipId === "string" && chipId.length > 0;
  const trimmedMsg = (message ?? "").trim();

  if (!hasChip && !trimmedMsg) {
    const reply = `${FAQ_INTRO}\n\n${FOLLOW_UP_QUESTION}`;
    return {
      reply,
      state: session.state,
      ...faqHubUi(session),
    };
  }

  if (hasChip) {
    const entry = getFaqById(chipId);
    if (!entry) {
      return {
        reply: "No reconozco esa opción. Elige una de las tarjetas de abajo.",
        state: session.state,
        ...faqHubUi(session),
      };
    }
    const answered = session.data.answeredFaqIds ?? [];
    if (!answered.includes(chipId)) {
      session.data.answeredFaqIds = [...answered, chipId];
    }
    const reply = `${entry.markdownBody}\n\n${FOLLOW_UP_QUESTION}`;
    return {
      reply,
      state: session.state,
      ...faqHubUi(session),
    };
  }

  if (trimmedMsg) {
    return {
      reply: "Por favor, elige una de las opciones disponibles abajo.",
      state: session.state,
      ...faqHubUi(session),
    };
  }

  const reply = `${FAQ_INTRO}\n\n${FOLLOW_UP_QUESTION}`;
  return {
    reply,
    state: session.state,
    ...faqHubUi(session),
  };
}
