const express = require("express");
const noteAiQuizzesController = require("../controllers/noteAiQuizzesController");

const router = express.Router();

// ---------------------------------------------
// POST /api/v1/notes/:id/aiquizzes
// Generate an AI quiz from a note
// ---------------------------------------------
router.post("/:id/aiquizzes", noteAiQuizzesController.createAiQuiz);

module.exports = router;
