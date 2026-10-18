import { buildPqaEvaluationPrompt } from "../prompts/buildPqaEvaluationPrompt.js";
import { STATES } from "../conversationFlow.js";
import { isValidPqaSentence } from "../parsers/isValidPqaSentence.js";

export async function pqaEvaluationHandler({ client, session, allowLlmCall }) {
  const pqaSentence = session.data.pqaSentence;
  if (!isValidPqaSentence(pqaSentence)) {
    session.state = STATES.PQA_PROMPT;
    return {
      reply: "Por favor, describe tu pensamiento en una sola frase.",
      state: session.state,
    };
  }

  let clarity;

  if (!(await allowLlmCall())) {
    // Rate-limited: skip the LLM and give the normal medium-clarity path.
    clarity = "medium";
  } else {
    const prompt = buildPqaEvaluationPrompt(pqaSentence);

    const modelResponse = await client.chatCompletion({
      model: "meta-llama/Llama-3.1-8B-Instruct:novita",
      messages: prompt,
      temperature: 0,
      max_tokens: 50,
    });

    const raw = modelResponse.choices[0].message.content;

    try {
      const parsed = JSON.parse(raw);
      clarity = parsed.clarity;
    } catch {
      clarity = "medium";
    }
  }

  session.data.pqaClarity = clarity;

  session.state = STATES.RECOMMENDATION;

  return {
    reply: null,
    state: session.state,
  };
}
