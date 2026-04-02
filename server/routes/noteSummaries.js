const express = require("express");
const noteSummariesController = require("../controllers/noteSummariesController");

const router = express.Router();

// Support both the plural and singular endpoints
router.post("/:id/summaries", noteSummariesController.createSummary);
router.post("/:id/summarize", noteSummariesController.createSummary);

module.exports = router;
