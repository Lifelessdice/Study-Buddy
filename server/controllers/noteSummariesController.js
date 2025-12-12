const Note = require("../models/notes");
const { summarizeText } = require("../config/openAIconfig");

// POST /api/v1/notes/:id/summaries (alias: /summarize)
exports.createSummary = async (req, res) => {
  try {
    const noteId = req.params.id;
    if (!noteId) {
      return res.status(400).json({
        success: false,
        message: "Note ID missing in request parameters"
      });
    }

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found"
      });
    }

    if (!note.content) {
      return res.status(400).json({
        success: false,
        message: "Note has no content to summarize"
      });
    }

    const summary = await summarizeText(note.content);
    if (!summary) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate summary"
      });
    }

    return res.status(200).json({
      success: true,
      data: { noteId: note._id, topic: note.topic, summary },
      summary,
      message: "Summary generated successfully"
    });
  } catch (error) {
    console.error("Error summarizing note:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};
