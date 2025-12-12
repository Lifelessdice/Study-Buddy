const express = require("express");
const router = express.Router();

const { createAIQuiz } = require("../controllers/noteAIQuizzesController");

// POST /api/v1/notes/:id/aiquizzes
router.post("/:id/aiquizzes", createAIQuiz);

module.exports = router;
