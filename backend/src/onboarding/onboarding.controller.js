import { InferenceClient } from "@huggingface/inference";
import { STATES } from "./conversationFlow.js";
import { faqHubHandler } from "./handlers/faqHubHandler.js";
import { timeSelectionHandler } from "./handlers/timeSelectionHandler.js";
import { compressedGuideHandler } from "./handlers/compressedGuideHandler.js";
import { pqaPromptHandler } from "./handlers/pqaPromptHandler.js";
import { pqaChallengeHandler } from "./handlers/pqaChallengeHandler.js";
import { pqaEvaluationHandler } from "./handlers/pqaEvaluationHandler.js";
import { recommendationHandler } from "./handlers/recommendationHandler.js";
import pool from "../db/db.js";
import { allowChatLlmCall } from "../rateLimit/limits.js";
import { clientIp } from "../rateLimit/clientIp.js";

export { FALLBACK_CHALLENGE } from "./handlers/pqaChallengeHandler.js";

const handlers = {
  [STATES.FAQ_HUB]: faqHubHandler,
  [STATES.TIME_SELECTION]: timeSelectionHandler,
  [STATES.COMPRESSED_GUIDE]: compressedGuideHandler,
  [STATES.PQA_PROMPT]: pqaPromptHandler,
  [STATES.PQA_CHALLENGE]: pqaChallengeHandler,
  [STATES.PQA_EVALUATION]: pqaEvaluationHandler,
  [STATES.RECOMMENDATION]: recommendationHandler,
  [STATES.EXIT]: async ({ session }) => ({
    reply: "Ya tienes orientación para seguir. Usa los botones de arriba para ir a la teoría o al test.",
    state: session.state,
  }),
};

/**
 * Serverless-compatible chat handler.
 *
 * Input: { message, sessionState: { state, data }, chipId? }
 * Output: { reply, state, data, ctaPrompt?, replyFull?, faqChips?, challengeChip?, challengePromptLabel? }
 *
 * sessionState is passed in/out explicitly (no in-memory storage).
 */
export const chatController = async ({
  message,
  sessionState,
  chipId,
  client = new InferenceClient(process.env.HF_TOKEN),
  // Denies by default so an entrypoint that forgets to wire a limit can't spend money.
  allowLlmCall = async () => false,
}) => {
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
      client,
      session,
      message,
      chipId,
      allowLlmCall,
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
 * Builds the per-request LLM budget check shared by both entrypoints. Any
 * failure (including a database error) counts as "not allowed" so the caller
 * falls back to canned output instead of calling the LLM.
 */
export const buildAllowLlmCall = (req) => async () => {
  try {
    return await allowChatLlmCall({
      ip: clientIp(req),
      now: req.now,
      db: req.db ?? pool,
    });
  } catch (err) {
    console.error("[chat/rateLimit]", err);
    return false;
  }
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
      client: req.llmClient,
      allowLlmCall: buildAllowLlmCall(req),
    });

    return res.json(result);
  } catch (err) {
    console.error("CHAT ERROR:", err);
    return res.status(500).json({
      error: err.response?.data || err.message || "Internal error while processing chat.",
    });
  }
};
