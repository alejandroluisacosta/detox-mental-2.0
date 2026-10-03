import { buildRecommendationReply } from "../parsers/buildRecommendationReply.js";
import { STATES } from "../conversationFlow.js";

export async function recommendationHandler({ session, locale }) {
  const clarity = session.data.pqaClarity ?? "low";

  const reply = buildRecommendationReply(clarity, locale);

  session.state = STATES.EXIT;

  return {
    reply,
    state: session.state,
  };
}
