const express = require("express");
const ctrl = require("../controllers/notesController");
const router = express.Router();

router.post("/", ctrl.createNote);
router.get("/", ctrl.getNotes);
router.get("/:id", ctrl.getNoteById);
router.patch("/:id", ctrl.updateNote);
router.put("/:id", ctrl.replaceNote);
router.delete("/:id", ctrl.deleteNote);
router.delete("/", ctrl.deleteAllNotes);

module.exports = router;
