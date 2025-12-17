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

function requireSummaryText(text, emptyMessage) {
  const trimmed = (text || "").trim();
  if (!trimmed) {
    const err = new Error(emptyMessage || "No text provided to summarize");
    err.statusCode = 400;
    throw err;
  }
  return trimmed;
}

async function buildAiSummaryPayload({ text, data, emptyMessage }) {
  const safeText = requireSummaryText(text, emptyMessage);
  return buildAiSummaryResponse({ text: safeText, data });
}

module.exports = {
  buildAiSummaryResponse,
  buildAiSummaryPayload
};
