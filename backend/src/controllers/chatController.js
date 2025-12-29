import { InferenceClient } from "@huggingface/inference";



export const chatController = async (req, res) => {
  const client = new InferenceClient(process.env.HF_TOKEN);
  try {
    // const { message } = req.body;
    const result = await client.chatCompletion({
      model: "meta-llama/Llama-3.1-8B-Instruct:novita",
      messages: [
        {
          role: "user",
          content: "Why is the sky blue?"
        }
      ]
    });
    console.log(res.json(result));
    return res.json({ reply: result.generated_text });
  } catch (err) {
    console.error("HF ERROR:", err);
    return res.status(500).json({ error: err.response?.data || err.message || "Unknown HF error" });
  }
};
