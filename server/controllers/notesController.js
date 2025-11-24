const mongoose = require("mongoose");
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
    const { id } = req.params;

    // Invalid ID → 400 CastError
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "CastError",
        message: "Invalid ID format",
      });
    }

    const note = await Note.findById(id).populate("course");

    if (!note) {
      return res.status(404).json({
        status: "fail",
        message: "Note not found",
      });
    }

    res.status(200).json({ status: "success", data: note });
  } catch (err) {
    next(err);
  }
};

// UPDATE (PATCH)
exports.updateNote = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "CastError",
        message: "Invalid ID format",
      });
    }

    const updated = await Note.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({
        status: "fail",
        message: "Note not found",
      });
    }

    res.status(200).json({ status: "success", data: updated });
  } catch (err) {
    next(err);
  }
};

// FULL REPLACE (PUT)
exports.replaceNote = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Step 1: invalid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "CastError",
        message: "Invalid ID format",
      });
    }

    // Step 2: Check if note exists
    const existing = await Note.findById(id);
    if (!existing) {
      return res.status(404).json({
        status: "fail",
        message: "Note not found",
      });
    }

    // Step 3: Validate required fields for PUT
    if (!req.body.topic) {
      const err = new Error("Topic is required");
      err.name = "ValidationError";
      throw err;
    }

    if (!req.body.content) {
      const err = new Error("Content is required");
      err.name = "ValidationError";
      throw err;
    }

    if (!req.body.course) {
      const err = new Error("Associated course is required");
      err.name = "ValidationError";
      throw err;
    }

    // Step 4: overwrite with validation
    existing.overwrite(req.body);
    await existing.save({ validateBeforeSave: true });

    res.status(200).json({
      status: "success",
      data: existing,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE ONE
exports.deleteNote = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Invalid ID → 400
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "CastError",
        message: "Invalid ID format",
      });
    }

    const deleted = await Note.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        status: "fail",
        message: "Note not found",
      });
    }

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
