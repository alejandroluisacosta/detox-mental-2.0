/**
 * Vercel Serverless API Route: /api/chat
 * 
 * This route handles chat requests in a stateless manner, compatible with Vercel's
 * serverless environment. State is passed in the request body and returned in the response.
 */

import { chatController } from "../src/controllers/chatController.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://www.detoxmental.es");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader('Access-Control-Allow-Credentials', 'true',);  

  // Preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  
  // Only accept POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, sessionState } = req.body;

  if (typeof message !== "string") {
    return res.status(400).json({ error: "message must be a string" });
  }

    // Call the refactored controller
    const result = await chatController({ message, sessionState });

    // Return the reply and updated state
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
