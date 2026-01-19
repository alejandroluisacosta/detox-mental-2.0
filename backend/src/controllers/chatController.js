import { InferenceClient } from "@huggingface/inference";
import { detoxMentalSystemPrompt } from "../prompts/systemPrompt.js";
import { STATES } from "../conversation/conversationFlow.js";
import { timeSelectionHandler } from "../conversation/handlers/timeSelectionHandler.js";
import { compressedGuideHandler } from "../conversation/handlers/compressedGuideHandler.js";
import { pqaPromptHandler } from "../conversation/handlers/pqaPromptHandler.js";
import { pqaEvaluationHandler } from "../conversation/handlers/pqaEvaluationHandler.js";
import { recommendationHandler } from "../conversation/handlers/recommendationHandler.js";

const handlers = {
  [STATES.TIME_SELECTION]: timeSelectionHandler,
  [STATES.COMPRESSED_GUIDE]: compressedGuideHandler,
  [STATES.PQA_PROMPT]: pqaPromptHandler,
  [STATES.PQA_EVALUATION]: pqaEvaluationHandler,
  [STATES.RECOMMENDATION]: recommendationHandler
};

/**
 * Serverless-compatible chat handler.
 * 
 * Input: { message, sessionState: { state, data } }
 * Output: { reply, state, data }
 * 
 * sessionState is passed in/out explicitly (no in-memory storage).
 */
export const chatController = async ({ message, sessionState }) => {
  const client = new InferenceClient(process.env.HF_TOKEN);
  
  // Initialize session state from input (defaults to TIME_SELECTION if not provided)
  const session = {
    state: sessionState?.state ?? STATES.TIME_SELECTION,
    data: sessionState?.data ?? {}
  };

  let reply;

  while (!reply) {
    const handler = handlers[session.state];
    if (!handler) throw new Error(`No handler for state ${session.state}`);

    const result = await handler({
      client,
      session,
      message,
      systemPrompt: detoxMentalSystemPrompt
    });
    reply = result.reply;
  }

  return {
    reply,
    state: session.state,
    data: session.data
  };
};

/**
 * Express middleware wrapper for backward compatibility.
 * This can be used in existing Express routes.
 */
export const chatControllerExpressMiddleware = async (req, res) => {
  try {
    const { message, sessionState } = req.body;

    const result = await chatController({ message, sessionState });

    return res.json(result);
  } catch (err) {
    console.error("CHAT ERROR:", err);
    return res.status(500).json({ error: err.response?.data || err.message || "Internal error while processing chat." });
  }
};
