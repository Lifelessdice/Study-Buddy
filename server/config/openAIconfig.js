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

    console.log("OpenAI raw response:", JSON.stringify(response, null, 2));

    // Try to extract text in multiple possible places
    if (response.output && response.output.length > 0) {
        for (const item of response.output) {
            if (item.content && item.content.length > 0) {
                for (const c of item.content) {
                    if (c.type === "output_text" && c.text) {
                        return c.text;
                    }
                    // fallback: sometimes it might be plain text directly
                    if (c.text) {
                        return c.text;
                    }
                }
            }
        }
    }

    throw new Error("Failed to extract summary from OpenAI response");
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

    // Use output_text for safer extraction
    const raw = response.output_text?.trim();
    if (!raw) {
        throw new Error("OpenAI returned empty output");
    }

    // Clean up possible extra text before parsing
    let jsonStart = raw.indexOf('[');
    let jsonEnd = raw.lastIndexOf(']') + 1;
    if (jsonStart === -1 || jsonEnd === -1) {
        console.error("Raw AI output:", raw);
        throw new Error("AI did not return a valid quiz JSON format.");
    }

    const jsonString = raw.slice(jsonStart, jsonEnd);

    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("Failed to parse quiz JSON:", jsonString);
        throw new Error("AI did not return a valid quiz JSON format.");
    }
}


module.exports = {
    summarizeText,
    generateQuiz
};
