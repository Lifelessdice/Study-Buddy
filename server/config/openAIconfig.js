const OpenAI = require("openai");

const OPENAI_API_KEY = "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";

if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key is missing. Set it in the code.");
}

const client = new OpenAI({ apiKey: OPENAI_API_KEY });

/**
 * Summarize note content
 */
async function summarizeText(text) {
    const response = await client.responses.create({
        model: "gpt-5-nano",
        input: `Summarize the following note in a clear and concise way:\n\n${text}`
    });

    return response.output[0].content[0].text;
}

/**
 * Generate quiz questions from note content
 * Returns: { questions: [ { question, options, answer }, ... ] }
 */
async function generateQuiz(text) {
    const response = await client.responses.create({
        model: "gpt-5-nano",
        input: `
Create a quiz from the following study notes.
Return the quiz in JSON format ONLY:
[
  {
    "question": "string",
    "options": ["A", "B", "C", "D"],
    "answer": "string"
  }
]

Notes:
${text}
`
    });

    // Extract raw text
    const raw = response.output[0].content[0].text;

    // Try parsing JSON safely
    try {
        return JSON.parse(raw);
    } catch (e) {
        console.error("Failed to parse quiz JSON:", raw);
        throw new Error("AI did not return a valid quiz JSON format.");
    }
}

module.exports = {
    summarizeText,
    generateQuiz
};
