const { summarizeText } = require("../config/openAIconfig");

async function buildAiSummaryResponse({ text, data }) {
  const summary = await summarizeText(text);
  return {
    success: true,
    data: {
      ...(data || {}),
      summary
    },
    summary,
    message: "Summary generated successfully"
  };
}

module.exports = {
  buildAiSummaryResponse
};
