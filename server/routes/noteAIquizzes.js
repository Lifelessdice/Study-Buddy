const express = require("express");
const router = express.Router();

const Note = require("../models/notes");
const { generateQuiz } = require("../config/openAIconfig");

// ---------------------------------------------
// POST /api/v1/notes/:id/quiz
// Generate an AI quiz from a note
// ---------------------------------------------
router.post("/:id/aiquizzes", async (req, res, next) => {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({
                status: "fail",
                message: "Note not found"
            });
        }

        const quiz = await generateQuiz(note.content);

        return res.status(200).json({
            status: "success",
            noteId: note._id,
            topic: note.topic,
            quiz: quiz
        });

    } catch (err) {
        next(err); // global error handler
    }
});

module.exports = router;
