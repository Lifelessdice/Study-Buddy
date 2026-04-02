const { generateQuiz } = require("../config/openAIconfig");

async function buildAiQuizResponse({ text, data }) {
  const quiz = await generateQuiz(text);
  return {
    status: "success",
    data: {
      ...(data || {}),
      quiz
    },
    quiz
  };
}

function requireQuizText(text, emptyMessage) {
  const trimmed = (text || "").trim();
  if (!trimmed) {
    const err = new Error(emptyMessage || "No text provided to generate a quiz");
    err.statusCode = 400;
    throw err;
  }
  return trimmed;
}

async function buildAiQuizPayload({ text, data, emptyMessage }) {
  const safeText = requireQuizText(text, emptyMessage);
  return buildAiQuizResponse({ text: safeText, data });
}

module.exports = {
  buildAiQuizResponse,
  buildAiQuizPayload
};
