const mongoose = require("mongoose");
const Quiz = require("../models/quizzes");
const Course = require("../models/courses");

function ensureRequiredFields(body) {
  const required = {
    title: "Quiz title is required",
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

// ---------------------------------------------
// Create a new quiz
// ---------------------------------------------
exports.createQuiz = async (req, res, next) => {
  try {
    ensureRequiredFields(req.body);
    await ensureCourseExists(req.body.course);

    const quiz = await Quiz.create(req.body);
    res.status(201).json({
      status: "success",
      data: quiz,
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

// ---------------------------------------------
// List all quizzes
// ---------------------------------------------
exports.getAllQuizzes = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.course) {
      if (!mongoose.Types.ObjectId.isValid(req.query.course)) {
        return res.status(400).json({
          error: "CastError",
          message: "Invalid course id format",
        });
      }
      filter.course = req.query.course;
    }

    const quizzes = await Quiz.find(filter);

    res.status(200).json({
      status: "success",
      results: quizzes.length,
      data: quizzes,
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

// ---------------------------------------------
// Get a single quiz by ID
// ---------------------------------------------
exports.getQuizById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Invalid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "CastError",
        message: "Invalid ID format",
      });
    }

    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return res.status(404).json({
        status: "fail",
        message: "Quiz not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: quiz,
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------
// Update a quiz by ID (PATCH)
// ---------------------------------------------
exports.updateQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Invalid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "CastError",
        message: "Invalid ID format",
      });
    }

    ensureNonEmptyIfPresent(req.body, "title", "Quiz title is required");
    if (Object.prototype.hasOwnProperty.call(req.body, "course")) {
      ensureNonEmptyIfPresent(req.body, "course", "Associated course is required");
      await ensureCourseExists(req.body.course);
    }

    const quiz = await Quiz.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!quiz) {
      return res.status(404).json({
        status: "fail",
        message: "Quiz not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: quiz,
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------
// Full replace a quiz (PUT)
// ---------------------------------------------
exports.replaceQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Step 1: invalid ObjectId → 400
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "CastError",
        message: "Invalid ID format",
      });
    }

    // Step 2: check if quiz exists → 404
    const existing = await Quiz.findById(id);
    if (!existing) {
      return res.status(404).json({
        status: "fail",
        message: "Quiz not found",
      });
    }

    // Step 3: required fields validation for PUT
    ensureRequiredFields(req.body);
    await ensureCourseExists(req.body.course);

    // Step 4: overwrite and validate
    existing.overwrite(req.body);
    await existing.save({ validateBeforeSave: true });

    res.status(200).json({
      status: "success",
      data: existing,
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

// ---------------------------------------------
// Delete a quiz by ID
// ---------------------------------------------
exports.deleteQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Invalid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "CastError",
        message: "Invalid ID format",
      });
    }

    const deleted = await Quiz.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        status: "fail",
        message: "Quiz not found",
      });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------
// Delete all quizzes
// ---------------------------------------------
exports.deleteAllQuizzes = async (req, res, next) => {
  try {
    await Quiz.deleteMany({});
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
