const Note = require("../models/notes");

async function findNoteOrThrow(noteId, options = {}) {
  const {
    missingMessage = "Note ID missing in request parameters",
    notFoundMessage = "Note not found"
  } = options;

  if (!noteId) {
    const err = new Error(missingMessage);
    err.statusCode = 400;
    throw err;
  }

  const note = await Note.findById(noteId);
  if (!note) {
    const err = new Error(notFoundMessage);
    err.statusCode = 404;
    throw err;
  }

  return note;
}

function requireNoteContent(note, emptyMessage) {
  if (!note.content) {
    const err = new Error(emptyMessage || "Note has no content");
    err.statusCode = 400;
    throw err;
  }
  return note.content;
}

module.exports = {
  findNoteOrThrow,
  requireNoteContent
};
