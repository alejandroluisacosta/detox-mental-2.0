import { onboardingMessage } from "../../i18n/onboardingMessages.js";
import { STATES } from "../conversationFlow.js";
import { normalizeLlmOutput } from "../parsers/normalizeLlmOutput.js";
import { buildPqaChallengeMessages } from "../prompts/buildPqaChallengePrompt.js";

const PQA_CHALLENGE_MODEL = "meta-llama/Llama-3.1-8B-Instruct:novita";

export async function pqaChallengeHandler({ client, session, locale }) {
  const pqaSentence = session.data.pqaSentence;
  if (!pqaSentence) {
    session.state = STATES.PQA_PROMPT;
    return {
      reply: onboardingMessage("pqaMissingSentence", locale),
      state: session.state,
    };
  }

  const messages = buildPqaChallengeMessages(pqaSentence, locale);
  const modelResponse = await client.chatCompletion({
    model: PQA_CHALLENGE_MODEL,
    messages,
    max_tokens: 150,
    temperature: 0.6,
  });

  const raw = modelResponse.choices[0].message?.content ?? "";
  const pqaChallenge =
    normalizeLlmOutput(raw) || onboardingMessage("pqaChallengeFallback", locale);

  session.data.pqaChallenge = pqaChallenge;
  session.state = STATES.PQA_EVALUATION;

  return {
    reply: pqaChallenge,
    state: session.state,
  };
}
