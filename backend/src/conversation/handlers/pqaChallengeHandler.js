import { STATES } from "../conversationFlow.js";

const PQA_CHALLENGE_MODEL = "meta-llama/Llama-3.1-8B-Instruct:novita";

function buildPqaChallengeMessages(pqaSentence) {
  return [
    {
      role: "user",
      content: `A person shared this thought: "${pqaSentence}"

Generate a single follow-up question that helps them expand or question this thought. The question should invite reflection, curiosity, or gentle challenge. Respond only with the question, using the same language as the thought.`
    }
  ];
}

export async function pqaChallengeHandler({ client, session }) {
  const pqaSentence = session.data.pqaSentence;
  if (!pqaSentence) {
    session.state = STATES.PQA_PROMPT;
    return {
      reply: "Por favor, describe tu pensamiento en una sola frase.",
      state: session.state
    };
  }

  const messages = buildPqaChallengeMessages(pqaSentence);
  const modelResponse = await client.chatCompletion({
    model: PQA_CHALLENGE_MODEL,
    messages,
    max_tokens: 150,
    temperature: 0.6
  });

  const raw = modelResponse.choices[0].message?.content?.trim() ?? "";
  const pqaChallenge = raw || "¿Qué te hace pensar eso?";

  session.data.pqaChallenge = pqaChallenge;
  session.state = STATES.PQA_EVALUATION;

  return {
    reply: pqaChallenge,
    state: session.state
  };
}
