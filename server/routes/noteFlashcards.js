const express = require("express");
const router = express.Router();

const Note = require("../models/notes");
const { buildAiFlashcardsResponse } = require("../services/aiFlashcards");

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

        if (!note.content) {
            return res.status(400).json({
                status: "fail",
                message: "Note has no content to generate flashcards"
            });
        }

        const payload = await buildAiFlashcardsResponse({
            text: note.content,
            data: {
                noteId: note._id,
                topic: note.topic
            }
        });
        return res.status(200).json(payload);

    } catch (err) {
        console.error("Error generating flashcards:", err);
        return res.status(500).json({
            status: "error",
            message: "Internal server error",
            error: err.message
        });
    }
});

module.exports = router;
