export function buildPqaEvaluationPrompt(pqaSentence) {
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