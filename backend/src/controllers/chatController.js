import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(process.env.HF_TOKEN);

export const chatController = async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ error: "Missing 'message' in request body" });
  }

  try {
    const response = await axios({
      url: "https://router.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf",
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      data: {
        inputs: userMessage,
      }
    });

    const output = response.data[0]?.generated_text || "No response generated";

    res.json({ response: output });

  } catch (error) {
    console.error("HF error:", error.response?.data || error.message || error);
    res.status(500).json({
      error: error.response?.data || error.message || "Unknown HF error"
    });
  }
};
