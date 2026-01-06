import { InferenceClient } from "@huggingface/inference";
import { timeSelectionHandler } from "../conversation/handlers/timeSelectionHandler.js";
import { detoxMentalSystemPrompt } from "../prompts/systemPrompt.js";
import { sessions } from "../conversation/sessionStore.js";
import { STATES } from "../conversation/conversationFlow.js";

const handlers = {
  [STATES.TIME_SELECTION]: timeSelectionHandler
};

export const chatController = async (req, res) => {
  const client = new InferenceClient(process.env.HF_TOKEN);
  try {
    const { message, sessionId } = req.body;

    const session = sessions[sessionId] ?? { state: STATES.TIME_SELECTION, data: {} };

    const handler = handlers[session.state];
    if (!handler) {
      throw new Error(`No handler for state: ${session.state}`);
    }

    const { reply, state } = await handler({
      client,
      session,
      message,
      systemPrompt: detoxMentalSystemPrompt,
    });

    return res.json({
      reply,
      state
    });
  } catch (err) {
    console.error("CHAT ERROR:", err);
    return res.status(500).json({ error: err.response?.data || err.message || "Internal error while processing chat." });
  }
};
