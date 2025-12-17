const express = require("express");
const router = express.Router();

const Note = require("../models/notes");
const { buildAiQuizPayload } = require("../services/aiQuiz");

// ---------------------------------------------
// POST /api/v1/notes/:id/aiquizzes
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
        next(err); // global error handler
    }
});

module.exports = router;
