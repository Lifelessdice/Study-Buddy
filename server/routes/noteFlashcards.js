const express = require("express");
const router = express.Router();

const { createFlashcards } = require("../controllers/noteFlashcardsController");

// POST /api/v1/notes/:id/flashcards
router.post("/:id/flashcards", createFlashcards);

module.exports = router;
