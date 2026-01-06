import { STATES } from "../conversationFlow.js";
import { timeSelectionPrompt } from "../../prompts/timeSelectionPrompt.js";
import { parseTimeSelection } from "../../parsers/parseTimeSelection.js"

export async function timeSelectionHandler({ client, session, message }) {
  // No user input yet → open the conversation
  if (!message) {
    const result = await client.chatCompletion({
      model: "meta-llama/Llama-3.1-8B-Instruct:novita",
      messages: timeSelectionPrompt(),
      max_tokens: 150
    });

    return {
      reply: result.choices[0].message.content,
      state: session.state
    };
  }

  // User replied → parse
  const minutes = parseTimeSelection(message);

  if (!minutes) {
    return {
      reply: "Por favor, responde con 2, 5 o 15 minutos.",
      state: session.state
    };
  }

  // Valid → transition
  session.state = STATES.COMPRESSED_GUIDE;
  session.data.timeBudget = minutes;

  return {
    reply: "Perfecto. Continuemos.",
    state: session.state
  };
}
