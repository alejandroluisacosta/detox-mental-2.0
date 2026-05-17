import { STATES } from "../conversationFlow.js";
import { normalizeLlmOutput } from "../parsers/normalizeLlmOutput.js";

const PQA_CHALLENGE_MODEL = "meta-llama/Llama-3.1-8B-Instruct:novita";

function buildPqaChallengeMessages(pqaSentence) {
  return [
    {
      role: "user",
      content: `A user just shared this thought with you: "${pqaSentence}"

Your task: generate a single follow-up question that you will ask the user to help them expand or question this thought. The question must be directed at the user (second person: "you"/"tú"/"te"/"ti"), not at yourself. It should invite reflection, curiosity, or gentle challenge.

Examples of correct form: "¿Qué te hace sentir así?" or "¿Qué te lleva a pensar eso?" — the question is for the user to answer, so it must address them (te/tú), not you (me/yo).

Respond only with the question, in the same language as the thought.`,
    },
  ];
}

export async function pqaChallengeHandler({ client, session }) {
  const pqaSentence = session.data.pqaSentence;
  if (!pqaSentence) {
    session.state = STATES.PQA_PROMPT;
    return {
      reply: "Por favor, describe tu pensamiento en una sola frase.",
      state: session.state,
    };
  }

  const messages = buildPqaChallengeMessages(pqaSentence);
  const modelResponse = await client.chatCompletion({
    model: PQA_CHALLENGE_MODEL,
    messages,
    max_tokens: 150,
    temperature: 0.6,
  });

  const raw = modelResponse.choices[0].message?.content ?? "";
  const pqaChallenge = normalizeLlmOutput(raw) || "¿Qué te hace pensar eso?";

  session.data.pqaChallenge = pqaChallenge;
  session.state = STATES.PQA_EVALUATION;

  return {
    reply: pqaChallenge,
    state: session.state,
  };
}
