const express = require("express");
const noteFlashcardsController = require("../controllers/noteFlashcardsController");

const router = express.Router();

// ---------------------------------------------
// POST /api/v1/notes/:id/flashcards
// Generate AI flashcards from a note
// ---------------------------------------------
router.post("/:id/flashcards", noteFlashcardsController.createFlashcards);

module.exports = router;
