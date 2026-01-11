import { buildRecommendationReply } from "../../parsers/buildRecommendationReply.js";
import { STATES } from "../conversationFlow.js";

export async function recommendationHandler({ session }) {
  const recommendation = session.data.recommendation;

  const reply = buildRecommendationReply(recommendation);

  session.state = STATES.EXIT;

  return {
    reply,
    state: session.state
  };
}
