/**
 * Vercel Serverless API Route: /api/chat
 *
 * Handles chat requests in a stateless manner for the backend Vercel deployment.
 * State is passed in the request body and returned in the response.
 *
 * CORS: Set FRONTEND_ORIGIN in Vercel (e.g. https://detox-mental-2-0.vercel.app)
 * so the browser allows requests from the frontend. OPTIONS (preflight) is handled
 * so the browser's automatic preflight request is accepted.
 */

import dotenv from "dotenv";
import { chatController } from "../src/controllers/chatController.js";

dotenv.config();

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "";

function setCorsHeaders(res) {
  if (FRONTEND_ORIGIN) {
    res.setHeader("Access-Control-Allow-Origin", FRONTEND_ORIGIN);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");
}

export default async function handler(req, res) {
  setCorsHeaders(res);

  // Handle preflight (browser sends this automatically before POST)
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

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
