const express = require("express");
const router = express.Router();

const { createSummary } = require("../controllers/noteSummariesController");

// Support both the plural and singular endpoints
router.post("/:id/summaries", createSummary);
router.post("/:id/summarize", createSummary);

module.exports = router;
