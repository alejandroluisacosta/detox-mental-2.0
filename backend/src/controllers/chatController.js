import axios from "axios";

export const chatController = async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ error: "Missing 'message' in request body" });
  }

  try {
    const response = await axios({
      url: "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3.1-8B-Instruct",
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      data: {
        inputs: userMessage,
        parameters: {
          max_new_tokens: 180,
          temperature: 0.7
        }
      }
    });

    const output = response.data[0]?.generated_text || "No response generated";

    res.json({ response: output });

  } catch (error) {
    console.error("HF error:", error.response?.data || error.message);
    res.status(500).json({ error: "HuggingFace request failed" });
  }
};
