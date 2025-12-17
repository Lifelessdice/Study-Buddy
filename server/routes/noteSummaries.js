var express = require("express");
var router = express.Router();

const Note = require("../models/notes");
const { buildAiSummaryPayload } = require("../services/aiSummary");

async function handleSummarize(req, res) {
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

        // 4. Summarize the note content
        const payload = await buildAiSummaryPayload({
            text: note.content,
            data: { noteId: note._id, topic: note.topic },
            emptyMessage: "Note has no content to summarize"
        });

        if (!payload.summary) {
            return res.status(500).json({
                success: false,
                message: "Failed to generate summary"
            });
        }

        // 5. Success response
        return res.status(200).json(payload);

    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
        }
        console.error("Error summarizing note:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

// Support both the plural and singular endpoints
router.post("/:id/summaries", handleSummarize);
router.post("/:id/summarize", handleSummarize);

module.exports = router;
