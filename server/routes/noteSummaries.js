var express = require("express");
var router = express.Router();

const Note = require("../models/notes");
const { summarizeText } = require("../config/openAIconfig");

// POST /notes/:id/summarize
router.post("/:id/summarize", async (req, res) => {
    try {
        // 1. Validate ID
        const noteId = req.params.id;
        if (!noteId) {
            return res.status(400).json({
                success: false,
                message: "Note ID missing in request parameters"
            });
        }

        // 2. Find note
        const note = await Note.findById(noteId);

        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }

        // 3. If content is missing
        if (!note.content) {
            return res.status(400).json({
                success: false,
                message: "Note has no content to summarize"
            });
        }

        // 4. Summarize the note content
        const summary = await summarizeText(note.content);

        if (!summary) {
            return res.status(500).json({
                success: false,
                message: "Failed to generate summary"
            });
        }

        // 5. Success response
        return res.status(200).json({
            success: true,
            data: {
                noteId: note._id,
                topic: note.topic,
                summary: summary
            },
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
});

module.exports = router;
