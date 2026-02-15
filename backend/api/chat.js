/**
 * Vercel Serverless API Route: /api/chat
 *
 * Handles chat requests in a stateless manner for the backend Vercel deployment.
 * State is passed in the request body and returned in the response.
 */

import dotenv from "dotenv";
import { chatController } from "../src/controllers/chatController.js";

dotenv.config();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, sessionState } = req.body;

    if (message != null && typeof message !== "string") {
      return res.status(400).json({ error: "Message must be a string" });
    }

    const result = await chatController({ message, sessionState });

    return res.status(200).json({
      reply: result.reply,
      sessionState: {
        state: result.state,
        data: result.data,
      },
    });
  } catch (err) {
    console.error("CHAT ERROR:", err);

    return res.status(500).json({
      error: err.message || "Internal server error",
    });
  }
}
