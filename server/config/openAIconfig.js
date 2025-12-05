const OpenAI = require("openai");

// Prefer environment variable, but fall back to the bundled project key so AI works out-of-the-box.
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "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";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const client = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

function cleanText(text) {
    return (text || "").toString().replace(/\s+/g, " ").trim();
}

function splitSentences(text) {
    const cleaned = cleanText(text);
    if (!cleaned) return [];
    return cleaned.split(/(?<=[.!?])\s+/).filter(Boolean);
}

function truncate(text, maxLength) {
    if (!text) return "";
    return text.length <= maxLength ? text : text.slice(0, maxLength).trimEnd() + "...";
}

function fallbackSummary(text) {
    const sentences = splitSentences(text);
    if (!sentences.length) return "";
    const summary = sentences.slice(0, 3).join(" ");
    return truncate(summary, 400);
}

function buildFallbackFlashcards(text) {
    const sentences = splitSentences(text);
    const base = sentences.length ? sentences : [cleanText(text)];
    return base.slice(0, 5).map((sentence, index) => ({
        question: `Key point ${index + 1}?`,
        answer: truncate(sentence, 220) || "No answer available"
    }));
}

function buildQuizOptions(correct, pool, questionIndex) {
    const options = [truncate(correct, 140)];
    for (const candidate of pool) {
        if (options.length >= 4) break;
        if (candidate !== correct) {
            options.push(truncate(candidate, 140));
        }
    }
    while (options.length < 4) {
        options.push(`Related concept ${questionIndex}.${options.length}`);
    }
    return options;
}

function buildFallbackQuiz(text) {
    const sentences = splitSentences(text);
    const pool = sentences.length ? sentences : [cleanText(text) || "Review the main topic of this note."];
    const selected = pool.slice(0, 3);
    while (selected.length < 3) {
        selected.push("Review the main idea of this note.");
    }
    return selected.map((sentence, index) => {
        const question = `What is emphasized in: "${truncate(sentence, 90)}"?`;
        const options = buildQuizOptions(sentence, pool, index + 1);
        return {
            question,
            options,
            answer: options[0]
        };
    });
}

async function runChat(messages, responseFormat) {
    if (!client) return null;
    try {
        const completion = await client.chat.completions.create({
            model: OPENAI_MODEL,
            messages,
            temperature: 0.25,
            ...(responseFormat ? { response_format: responseFormat } : {})
        });
        return completion.choices?.[0]?.message?.content?.trim() || null;
    } catch (err) {
        console.error("OpenAI request failed:", err.message);
        return null;
    }
}

function parseQuiz(raw) {
    if (!raw) return null;
    try {
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        const quizArray = Array.isArray(parsed) ? parsed :
            Array.isArray(parsed.quiz) ? parsed.quiz :
            Array.isArray(parsed.questions) ? parsed.questions : null;
        if (!quizArray) return null;

        return quizArray.map((item, index) => {
            const question = cleanText(item.question) || `Question ${index + 1}`;
            let options = Array.isArray(item.options) ? item.options.filter(Boolean).map(cleanText) : [];
            options = options.slice(0, 4);
            while (options.length < 4) {
                options.push(`Choice ${options.length + 1}`);
            }
            const answer = cleanText(item.answer) || options[0] || "N/A";
            return { question, options, answer };
        });
    } catch (err) {
        console.error("Failed to parse AI quiz:", err.message);
        return null;
    }
}

function parseFlashcards(raw) {
    if (!raw) return null;
    try {
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        const cards = Array.isArray(parsed) ? parsed :
            Array.isArray(parsed.flashcards) ? parsed.flashcards :
            Array.isArray(parsed.cards) ? parsed.cards : null;
        if (!cards) return null;

        return cards.map((card, index) => ({
            question: cleanText(card.question) || `Flashcard ${index + 1}`,
            answer: cleanText(card.answer) || cleanText(card.response) || "No answer provided"
        }));
    } catch (err) {
        console.error("Failed to parse AI flashcards:", err.message);
        return null;
    }
}

async function summarizeText(text) {
    const content = cleanText(text);
    if (!content) {
        throw new Error("No text provided to summarize");
    }

    const aiSummary = await runChat([
        { role: "system", content: "You condense study notes into short summaries. Keep it under 120 words, avoid bullet points, and respond with plain text only." },
        { role: "user", content: content }
    ]);

    return aiSummary || fallbackSummary(content);
}

async function generateQuiz(text) {
    const content = cleanText(text);
    if (!content) {
        throw new Error("No text provided to generate a quiz");
    }

    const aiResponse = await runChat([
        { role: "system", content: "Create short multiple-choice quiz questions from the user's study notes. Respond as JSON with a `quiz` array. Each entry: {\"question\": string, \"options\": [\"A\",\"B\",\"C\",\"D\"], \"answer\": string}." },
        { role: "user", content: content }
    ], { type: "json_object" });

    const quiz = parseQuiz(aiResponse) || buildFallbackQuiz(content);
    return quiz;
}

async function generateFlashcards(text) {
    const content = cleanText(text);
    if (!content) {
        throw new Error("No text provided to generate flashcards");
    }

    const aiResponse = await runChat([
        { role: "system", content: "Turn the user's notes into concise flashcards. Respond as JSON with a `flashcards` array. Each entry: {\"question\": string, \"answer\": string}." },
        { role: "user", content: content }
    ], { type: "json_object" });

    const flashcards = parseFlashcards(aiResponse) || buildFallbackFlashcards(content);
    return flashcards;
}

module.exports = {
    summarizeText,
    generateQuiz,
    generateFlashcards
};
