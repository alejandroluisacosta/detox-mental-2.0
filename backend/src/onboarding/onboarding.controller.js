import { InferenceClient } from "@huggingface/inference";
import { localeFromRequest, parseLocale } from "../i18n/locale.js";
import { onboardingMessage } from "../i18n/onboardingMessages.js";
import { STATES } from "./conversationFlow.js";
import { faqHubHandler } from "./handlers/faqHubHandler.js";
import { timeSelectionHandler } from "./handlers/timeSelectionHandler.js";
import { compressedGuideHandler } from "./handlers/compressedGuideHandler.js";
import { pqaPromptHandler } from "./handlers/pqaPromptHandler.js";
import { pqaChallengeHandler } from "./handlers/pqaChallengeHandler.js";
import { pqaEvaluationHandler } from "./handlers/pqaEvaluationHandler.js";
import { recommendationHandler } from "./handlers/recommendationHandler.js";

const handlers = {
  [STATES.FAQ_HUB]: faqHubHandler,
  [STATES.TIME_SELECTION]: timeSelectionHandler,
  [STATES.COMPRESSED_GUIDE]: compressedGuideHandler,
  [STATES.PQA_PROMPT]: pqaPromptHandler,
  [STATES.PQA_CHALLENGE]: pqaChallengeHandler,
  [STATES.PQA_EVALUATION]: pqaEvaluationHandler,
  [STATES.RECOMMENDATION]: recommendationHandler,
  [STATES.EXIT]: async ({ session, locale }) => ({
    reply: onboardingMessage("exitReply", locale),
    state: session.state,
  }),
};

/**
 * Serverless-compatible chat handler.
 *
 * Input: { message, sessionState: { state, data }, chipId?, locale? }
 * Output: { reply, state, data, ctaPrompt?, replyFull?, faqChips?, challengeChip?, challengePromptLabel? }
 *
 * sessionState is passed in/out explicitly (no in-memory storage).
 */
export const chatController = async ({
  message,
  sessionState,
  chipId,
  locale,
  client,
}) => {
  const resolvedLocale = parseLocale(locale);
  const hfClient = client ?? new InferenceClient(process.env.HF_TOKEN);

  const session = {
    state: sessionState?.state ?? STATES.FAQ_HUB,
    data: sessionState?.data ?? {},
  };

  let reply;
  let lastResult;
  let safety = 0;

  while (!reply && safety < 3) {
    const handler = handlers[session.state];
    if (!handler) throw new Error(`No handler for state ${session.state}`);

    lastResult = await handler({
      client: hfClient,
      session,
      message,
      chipId,
      locale: resolvedLocale,
    });
    reply = lastResult.reply;
    safety++;
  }

  if (!reply) {
    throw new Error("No reply generated after safety limit");
  }
  return {
    reply,
    state: session.state,
    data: session.data,
    ...(lastResult.ctaPrompt != null && { ctaPrompt: lastResult.ctaPrompt }),
    ...(lastResult.replyFull != null && { replyFull: lastResult.replyFull }),
    ...(lastResult.faqChips != null && { faqChips: lastResult.faqChips }),
    ...(lastResult.challengeChip != null && { challengeChip: lastResult.challengeChip }),
    ...(lastResult.challengePromptLabel != null && {
      challengePromptLabel: lastResult.challengePromptLabel,
    }),
  };
};

/**
 * Express middleware wrapper for backward compatibility.
 */
export const chatControllerExpressMiddleware = async (req, res) => {
  try {
    const { message, sessionState, chipId } = req.body;

    if (chipId != null && typeof chipId !== "string") {
      return res.status(400).json({ error: "chipId must be a string when provided." });
    }

    const result = await chatController({
      message,
      sessionState,
      chipId,
      locale: localeFromRequest(req),
    });

    return res.json(result);
  } catch (err) {
    console.error("CHAT ERROR:", err);
    return res.status(500).json({
      error: err.response?.data || err.message || "Internal error while processing chat.",
    });
  }
};
