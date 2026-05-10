import { buildPqaEvaluationPrompt } from "../prompts/buildPqaEvaluationPrompt.js";
import { STATES } from "../conversationFlow.js";

export async function pqaEvaluationHandler({ client, session }) {
  const pqaSentence = session.data.pqaSentence;

  const prompt = buildPqaEvaluationPrompt(pqaSentence);

  const modelResponse = await client.chatCompletion({
    model: "meta-llama/Llama-3.1-8B-Instruct:novita",
    messages: prompt,
    temperature: 0,
    max_tokens: 50,
  });

  const raw = modelResponse.choices[0].message.content;

  let clarity;
  try {
    const parsed = JSON.parse(raw);
    clarity = parsed.clarity;
  } catch {
    clarity = "low";
  }

  session.data.pqaClarity = clarity;

  session.state = STATES.RECOMMENDATION;

  return {
    reply: null,
    state: session.state,
  };
}
