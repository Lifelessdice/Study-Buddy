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

module.exports = {
  buildAiQuizResponse
};
