const OpenAI = require("openai");

const OPENAI_API_KEY = "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";

if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key is missing. Set it in the code.");
}

const client = new OpenAI({ apiKey: OPENAI_API_KEY });

async function summarizeText(text) {
    const response = await client.responses.create({
        model: "gpt-5-nano",
        input: `Summarize the following note in a clear and concise way:\n\n${text}`
    });

    return response.output[0].content[0].text;
}

module.exports = { summarizeText };
