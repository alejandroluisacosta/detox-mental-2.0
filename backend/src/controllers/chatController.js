import { InferenceClient } from "@huggingface/inference";
import { detoxMentalSystemPrompt } from "../prompts/systemPrompt.js";
import { sessions } from "../conversation/sessionStore.js";
import { STATES } from "../conversation/conversationFlow.js";
import { timeSelectionHandler } from "../conversation/handlers/timeSelectionHandler.js";
import { compressedGuideHandler } from "../conversation/handlers/compressedGuideHandler.js";

const handlers = {
  [STATES.TIME_SELECTION]: timeSelectionHandler,
  [STATES.COMPRESSED_GUIDE]: compressedGuideHandler
};

export const chatController = async (req, res) => {
  const client = new InferenceClient(process.env.HF_TOKEN);
  try {
    const { message, sessionId } = req.body;

    let session = sessions[sessionId];

    if (!session) {
      session = { state: STATES.TIME_SELECTION, data: {} };
      sessions[sessionId] = session;
    }

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
    
    console.log(sessions)
    return res.json({
      reply,
      state: session.state
    });
  } catch (err) {
    console.error("CHAT ERROR:", err);
    return res.status(500).json({ error: err.response?.data || err.message || "Internal error while processing chat." });
  }
};
