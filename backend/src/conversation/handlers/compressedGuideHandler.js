// src/conversation/handlers/compressedGuideHandler.js
import { STATES } from "../conversationFlow.js";

const TOKEN_BUDGET_BY_TIME = {
  2: 500,
  5: 1000,
  15: 2500
};

export async function compressedGuideHandler({ client, session, message, systemPrompt }) {
    const { timeBudget } = session.data;
    const maxTokens = TOKEN_BUDGET_BY_TIME[session.data.timeBudget] ?? 700;

    const openingPrompt = `
    Perfecto, aquí tienes un resumen de nuestra filosofía para que puedas leerlo en ${timeBudget} minutos.\n`

    // Main summary prompt based on user's time
    const summaryPrompt = [
        {
        role: "system",
        content: systemPrompt
        },
        {
        role: "assistant",
        content: `
    Bien, según tu tiempo disponible (${timeBudget} minutos), aquí tienes un resumen de Detox Mental:

    [Por favor, resume los conceptos principales de Detox Mental de forma que tome aproximadamente ${timeBudget} minutos leer/practicar.]
    `
        }
    ];
    const result = await client.chatCompletion({
        model: "meta-llama/Llama-3.1-8B-Instruct:novita",
        messages: summaryPrompt,
        max_tokens: maxTokens,
        temperature: 0.6,
        top_p: 0.9
    });

    // Append the "challenge" prompt after the summary
    const challengePrompt = `
    \nEn Detox Mental valoramos la práctica, la experimentación. Creemos que la única forma de lidiar con tus pensamientos problemáticos es clarificándolos para luego trabajar en ellos eficientemente, teniendo el máximo impacto en el menor tiempo posible.

    Somos también amantes de los desafíos, así que este es mi primer desafío para ti: ¿puedes describir tus PQAs (Pensamientos Que Atormentan) en solo una (1) frase?

    Dame tu mejor respuesta y te diré qué camino es mejor para ti en este punto: una exploración más profunda de nuestros conceptos o nuestro programa de práctica estructurada.

    Recuerda: una sola frase.

    Tu turno.
    `;

    session.state = STATES.PQA_ARTICULATION;

    return {
        reply: openingPrompt + result.choices[0].message.content + challengePrompt,
        state: session.state
    };
}
