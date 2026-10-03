import { onboardingMessage } from "../../i18n/onboardingMessages.js";
import { STATES } from "../conversationFlow.js";
import { parseTimeSelection } from "../parsers/parseTimeSelection.js";

export async function timeSelectionHandler({ session, message, locale }) {
  // No user input yet → open the conversation
  if (!message) {
    return {
      reply: onboardingMessage("timeSelectionPrompt", locale),
      state: session.state,
    };
  }

  // User replied → parse
  const minutes = parseTimeSelection(message);

  if (!minutes) {
    const attempts = session.data.timeSelectionAttempts ?? 0;
    session.data.timeSelectionAttempts = attempts + 1;

    const invalidReplies = onboardingMessage("timeSelectionInvalid", locale);
    const reply =
      attempts >= invalidReplies.length
        ? onboardingMessage("ignoring", locale)
        : invalidReplies[attempts];

    return {
      reply,
      state: session.state,
    };
  }

  // Valid → transition (remember if they were in "Ignorándote" phase for compressed guide)
  const IGNORING_THRESHOLD = 10;
  const wasIgnored = (session.data.timeSelectionAttempts ?? 0) >= IGNORING_THRESHOLD;
  if (wasIgnored) session.data.ignoredDuringTimeSelection = true;
  session.state = STATES.COMPRESSED_GUIDE;
  session.data.timeBudget = minutes;
  delete session.data.timeSelectionAttempts;
  return {
    reply: null,
    state: session.state,
  };
}
