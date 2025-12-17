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

module.exports = {
  buildAiFlashcardsResponse
};
