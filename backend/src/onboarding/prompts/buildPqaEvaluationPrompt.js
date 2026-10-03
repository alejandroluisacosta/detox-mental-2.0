export function buildPqaEvaluationPrompt(pqaSentence, locale = "en") {
    return [
        {
        role: "system",
        content: `
        You are a classifier.
        Do not explain.
        Respond ONLY with valid JSON.
        `
        },
        {
        role: "user",
        content: `
        Analyze the following sentence describing a person's problematic thoughts.
        
        Sentence:
        "${pqaSentence}"
        
        The sentence may be written in English or Spanish. Classify clarity regardless of language.
        The user's interface language is ${locale}. This does not change the JSON-only output.
        
        Classify the clarity of the sentence using ONLY one of the following values:
        - low
        - medium
        - high
        
        Criteria:
        - Low: vague, abstract, generalized, identity-based, diffuse, or completely unrelated to the topic
        - Medium: partially concrete but unfocused or mixed
        - High: concrete, owned, specific, behavior-linked
        
        Respond ONLY with a JSON object like:
        { "clarity": "low" | "medium" | "high" }
        `
        }
    ]
}
