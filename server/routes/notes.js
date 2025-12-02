const express = require("express");
const notesController = require("../controllers/notesController");
const protect = require("../middleware/protect");

const router = express.Router();

router
  .route("/")
  .get(notesController.getNotes)
  .post(protect, notesController.createNote)
  .delete(protect, notesController.deleteAllNotes);

router
  .route("/:id")
  .get(notesController.getNoteById)
  .patch(protect, notesController.updateNote)
  .put(protect, notesController.replaceNote)
  .delete(protect, notesController.deleteNote);

module.exports = router;
