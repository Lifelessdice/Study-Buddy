const { buildAiFlashcardsPayload } = require("../services/aiFlashcards");
const { findNoteOrThrow, requireNoteContent } = require("../services/noteAi");

exports.createFlashcards = async (req, res) => {
  try {
    const note = await findNoteOrThrow(req.params.id);
    requireNoteContent(note, "Note has no content to generate flashcards");

    const payload = await buildAiFlashcardsPayload({
      text: note.content,
      data: {
        noteId: note._id,
        topic: note.topic
      },
      emptyMessage: "Note has no content to generate flashcards"
    });
    return res.status(200).json(payload);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    if (statusCode === 500) {
      console.error("Error generating flashcards:", err);
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: err.message
      });
    }
    return res.status(statusCode).json({
      status: "fail",
      message: err.message
    });
  }
};
