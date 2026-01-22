/**
 * Vercel Serverless API Route: /api/chat
 * 
 * This route handles chat requests in a stateless manner, compatible with Vercel's
 * serverless environment. State is passed in the request body and returned in the response.
 */

import { chatController } from "../../backend/src/controllers/chatController.js";

export default async function handler(req, res) {
  
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, sessionState } = req.body;

  if (typeof message !== "string") {
    return res.status(400).json({ error: "message must be a string" });
  }

    const result = await chatController({ message, sessionState });

    return res.status(200).json({
      reply: result.reply,
      sessionState: {
        state: result.state,
        data: result.data
      }
    });
  } catch (err) {
    console.error("CHAT ERROR:", err);
    
    return res.status(500).json({
      error: err.response?.data || err.message || "Internal error while processing chat."
    });
  }
}
