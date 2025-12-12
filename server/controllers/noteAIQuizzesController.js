const Note = require("../models/notes");
const { generateQuiz } = require("../config/openAIconfig");

// POST /api/v1/notes/:id/aiquizzes
exports.createAIQuiz = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        status: "fail",
        message: "Note not found"
      });
    }

    if (!note.content) {
      return res.status(400).json({
        status: "fail",
        message: "Note has no content to generate a quiz"
      });
    }

    const quiz = await generateQuiz(note.content);

    return res.status(200).json({
      status: "success",
      data: {
        noteId: note._id,
        topic: note.topic,
        quiz
      },
      quiz
    });
  } catch (err) {
    next(err);
  }
};
