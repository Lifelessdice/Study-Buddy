var express = require("express");
var router = express.Router();

const { buildAiSummaryPayload } = require("../services/aiSummary");
const { findNoteOrThrow, requireNoteContent } = require("../services/noteAi");

async function handleSummarize(req, res) {
    try {
        const note = await findNoteOrThrow(req.params.id);
        requireNoteContent(note, "Note has no content to summarize");

        // Summarize the note content
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

        // Success response
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
