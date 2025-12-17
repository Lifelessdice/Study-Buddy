const mongoose = require("mongoose");
const Note = require("../models/notes");
const Course = require("../models/courses");
const { ensureDocSlug } = require("../Utils/slugify");

function ensureRequiredFields(body) {
  const required = {
    topic: "Topic is required",
    content: "Content is required",
    course: "Associated course is required"
  };

  for (const [field, message] of Object.entries(required)) {
    const value = body[field];
    if (
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "")
    ) {
      const err = new Error(message);
      err.name = "ValidationError";
      throw err;
    }
  }
}

function ensureNonEmptyIfPresent(body, field, message) {
  if (Object.prototype.hasOwnProperty.call(body, field)) {
    const value = body[field];
    if (
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "")
    ) {
      const err = new Error(message);
      err.name = "ValidationError";
      throw err;
    }
  }
}

async function ensureCourseExists(courseId) {
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    const err = new Error("Invalid course id format");
    err.name = "CastError";
    throw err;
  }

  const course = await Course.findById(courseId);
  if (!course) {
    const err = new Error("Course not found");
    err.name = "NotFound";
    throw err;
  }
}

function buildNoteQueryByParam(param) {
  if (!param) return null;
  if (mongoose.Types.ObjectId.isValid(param)) {
    return Note.findById(param);
  }
  return Note.findOne({ slug: param });
}

// CREATE
exports.createNote = async (req, res, next) => {
  try {
    ensureRequiredFields(req.body);
    await ensureCourseExists(req.body.course);

    const note = await Note.create(req.body);
    res.status(201).json({ status: "success", data: note });
  } catch (err) {
    if (err && err.name === "NotFound") {
      return res.status(404).json({
        status: "fail",
        message: err.message
      });
    }
    next(err);
  }
};

// LIST ALL
exports.getNotes = async (req, res, next) => {
  try {
    const notes = await Note.find().populate("course");
    for (const note of notes) {
      await ensureDocSlug(note, note.topic);
    }
    res.status(200).json({
      status: "success",
      results: notes.length,
      data: notes
    });
  } catch (err) {
    next(err);
  }
};

// GET BY ID
exports.getNoteById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const query = buildNoteQueryByParam(id);
    const note = query ? await query.populate("course") : null;

    if (!note) {
      return res.status(404).json({
        status: "fail",
        message: "Note not found"
      });
    }

    await ensureDocSlug(note, note.topic);
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
        message: "Invalid ID format"
      });
    }

    ensureNonEmptyIfPresent(req.body, "topic", "Topic is required");
    ensureNonEmptyIfPresent(req.body, "content", "Content is required");
    if (Object.prototype.hasOwnProperty.call(req.body, "course")) {
      ensureNonEmptyIfPresent(req.body, "course", "Associated course is required");
      await ensureCourseExists(req.body.course);
    }

    const updated = await Note.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updated) {
      return res.status(404).json({
        status: "fail",
        message: "Note not found"
      });
    }

    res.status(200).json({ status: "success", data: updated });
  } catch (err) {
    if (err && err.name === "NotFound") {
      return res.status(404).json({
        status: "fail",
        message: err.message
      });
    }
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
        message: "Invalid ID format"
      });
    }

    // Step 2: Check if note exists
    const existing = await Note.findById(id);
    if (!existing) {
      return res.status(404).json({
        status: "fail",
        message: "Note not found"
      });
    }

    // Step 3: Validate required fields for PUT
    ensureRequiredFields(req.body);
    await ensureCourseExists(req.body.course);

    // Step 4: overwrite with validation
    existing.overwrite(req.body);
    await existing.save({ validateBeforeSave: true });

    res.status(200).json({
      status: "success",
      data: existing
    });
  } catch (err) {
    if (err && err.name === "NotFound") {
      return res.status(404).json({
        status: "fail",
        message: err.message
      });
    }
    next(err);
  }
};

// DELETE ONE
exports.deleteNote = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Invalid ID -> 400
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "CastError",
        message: "Invalid ID format"
      });
    }

    const deleted = await Note.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        status: "fail",
        message: "Note not found"
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
