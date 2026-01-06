const { buildAiQuizPayload } = require("../services/aiQuiz");
const { findNoteOrThrow, requireNoteContent } = require("../services/noteAi");

exports.createAiQuiz = async (req, res, next) => {
  try {
    const note = await findNoteOrThrow(req.params.id);
    requireNoteContent(note, "Note has no content to generate a quiz");

    const payload = await buildAiQuizPayload({
      text: note.content,
      data: {
        noteId: note._id,
        topic: note.topic
      },
      emptyMessage: "Note has no content to generate a quiz"
    });
    return res.status(200).json(payload);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        status: "fail",
        message: err.message
      });
    }
    next(err);
  }
};
