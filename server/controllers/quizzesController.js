const mongoose = require("mongoose");
const Quiz = require("../models/quizzes");

// ---------------------------------------------
// Create a new quiz
// ---------------------------------------------
exports.createQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json({
      status: "success",
      data: quiz,
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------
// List all quizzes
// ---------------------------------------------
exports.getAllQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find();

    res.status(200).json({
      status: "success",
      results: quizzes.length,
      data: quizzes,
    });
  } catch (err) {
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
    if (!req.body.title) {
      const err = new Error("Quiz title is required");
      err.name = "ValidationError";
      throw err;
    }

    if (!req.body.course) {
      const err = new Error("Associated course is required");
      err.name = "ValidationError";
      throw err;
    }

    // Step 4: overwrite and validate
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
