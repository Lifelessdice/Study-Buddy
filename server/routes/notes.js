const express = require("express");
const notesController = require("../controllers/notesController");

const router = express.Router();

router
  .route("/")
  .get(notesController.getNotes)
  .post(notesController.createNote)
  .delete(notesController.deleteAllNotes);

router
  .route("/:id")
  .get(notesController.getNoteById)
  .patch(notesController.updateNote)
  .put(notesController.replaceNote)
  .delete(notesController.deleteNote);

module.exports = router;
