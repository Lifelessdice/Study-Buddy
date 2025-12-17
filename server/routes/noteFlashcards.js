const express = require("express");
const router = express.Router();

const Note = require("../models/notes");
const { buildAiFlashcardsPayload } = require("../services/aiFlashcards");

// ---------------------------------------------
// POST /api/v1/notes/:id/flashcards
// Generate AI flashcards from a note
// ---------------------------------------------
router.post("/:id/flashcards", async (req, res, next) => {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({
                status: "fail",
                message: "Note not found"
            });
        }

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
});

module.exports = router;
