var express = require("express");
var router = express.Router();

const Note = require("../models/notes");
const { summarizeText } = require("../config/openAIconfig");

router.post("/:id/summarize", async (req, res, next) => {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        const summary = await summarizeText(note.content);

        res.json({
            noteId: note._id,
            topic: note.topic,
            summary
        });

    } catch (err) {
        next(err);
    }
});

module.exports = router;
