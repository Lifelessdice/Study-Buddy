const { generateFlashcards } = require("../config/openAIconfig");

async function buildAiFlashcardsResponse({ text, data }) {
  const flashcards = await generateFlashcards(text);
  return {
    status: "success",
    data: {
      ...(data || {}),
      flashcards
    },
    flashcards
  };
}

function requireFlashcardText(text, emptyMessage) {
  const trimmed = (text || "").trim();
  if (!trimmed) {
    const err = new Error(emptyMessage || "No text provided to generate flashcards");
    err.statusCode = 400;
    throw err;
  }
  return trimmed;
}

async function buildAiFlashcardsPayload({ text, data, emptyMessage }) {
  const safeText = requireFlashcardText(text, emptyMessage);
  return buildAiFlashcardsResponse({ text: safeText, data });
}

module.exports = {
  buildAiFlashcardsResponse,
  buildAiFlashcardsPayload
};
