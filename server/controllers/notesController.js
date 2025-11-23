const Note = require("../models/notes");

// CREATE
exports.createNote = async (req, res, next) => {
  try {
    const note = await Note.create(req.body);
    res.status(201).json({ status: "success", data: note });
  } catch (err) {
    next(err);
  }
};

// LIST ALL
exports.getNotes = async (req, res, next) => {
  try {
    const notes = await Note.find().populate("course");
    res.status(200).json({
      status: "success",
      results: notes.length,
      data: notes,
    });
  } catch (err) {
    next(err);
  }
};

// GET BY ID
exports.getNoteById = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id).populate("course");

    if (!note)
      return res.status(404).json({ status: "fail", message: "Note not found" });

    res.status(200).json({ status: "success", data: note });
  } catch (err) {
    next(err);
  }
};

// UPDATE (PATCH)
exports.updateNote = async (req, res, next) => {
  try {
    const updated = await Note.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated)
      return res.status(404).json({ status: "fail", message: "Note not found" });

    res.status(200).json({ status: "success", data: updated });
  } catch (err) {
    next(err);
  }
};

// FULL REPLACE (PUT)
exports.replaceNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note)
      return res.status(404).json({ status: "fail", message: "Note not found" });

    const { _id, ...rest } = req.body;

    note.overwrite(rest);
    await note.save();

    res.status(200).json({ status: "success", data: note });
  } catch (err) {
    next(err);
  }
};

// DELETE ONE
exports.deleteNote = async (req, res, next) => {
  try {
    const deleted = await Note.findByIdAndDelete(req.params.id);

    if (!deleted)
      return res.status(404).json({ status: "fail", message: "Note not found" });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// DELETE ALL
exports.deleteAllNotes = async (req, res, next) => {
  try {
    await Note.deleteMany({});
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
