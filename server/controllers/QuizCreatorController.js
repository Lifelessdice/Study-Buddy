const mongoose = require("mongoose");
const User = require("../models/users");
const Quiz = require("../models/quizzes");

// Validate ObjectId helper
function validateId(id, label) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error(`Invalid ${label} id format`);
    err.name = "CastError";
    throw err;
  }
}

// Helper function: find creator or 404
async function findQuizCreatorOr404(creatorId) {
  validateId(creatorId, "creator");

  const creator = await User.findOne({ _id: creatorId, role: "teacher" });

  if (!creator) {
    const err = new Error("Quiz creator not found");
    err.name = "NotFound";
    throw err;
  }

  return creator;
}

// --------------------------------------------------------
// CREATE QUIZ
// POST /api/v1/quizcreators/:creatorId/quizzes
// --------------------------------------------------------
exports.createQuiz = async (req, res, next) => {
  try {
    const { creatorId } = req.params;

    const creator = await findQuizCreatorOr404(creatorId);

    // IMPORTANT: prevent user from overriding createdBy
    const { createdBy, ...payload } = req.body;

    // Required fields validation (if your schema requires them)
    // If the Quiz schema already enforces required fields, mongoose will throw ValidationError.

    const quiz = await Quiz.create({
      ...payload,
      createdBy: creator._id
    });

    return res.status(201).json({
      status: "success",
      data: quiz
    });

  } catch (err) {
    // Validation error (missing fields)
    if (err && err.name === "ValidationError") {
      return res.status(400).json({
        error: "ValidationError",
        message: err.message
      });
    }

    // Invalid objectId
    if (err && err.name === "CastError") {
      return res.status(400).json({
        error: "CastError",
        message: err.message
      });
    }

    // creator not found
    if (err && err.name === "NotFound") {
      return res.status(404).json({
        status: "fail",
        message: err.message
      });
    }

    next(err);
  }
};

// --------------------------------------------------------
// LIST QUIZZES BY CREATOR
// GET /api/v1/quizcreators/:creatorId/quizzes
// --------------------------------------------------------
exports.getQuizzesByCreator = async (req, res, next) => {
  try {
    const { creatorId } = req.params;

    const creator = await findQuizCreatorOr404(creatorId);

    const quizzes = await Quiz.find({ createdBy: creator._id });

    return res.status(200).json({
      status: "success",
      results: quizzes.length,
      data: quizzes
    });

  } catch (err) {
    if (err && err.name === "CastError") {
      return res.status(400).json({
        error: "CastError",
        message: err.message
      });
    }

    if (err && err.name === "NotFound") {
      return res.status(404).json({
        status: "fail",
        message: err.message
      });
    }

    next(err);
  }
};

// --------------------------------------------------------
// GET SPECIFIC QUIZ BY CREATOR
// GET /api/v1/quizcreators/:creatorId/quizzes/:quizId
// --------------------------------------------------------
exports.getQuizById = async (req, res, next) => {
  try {
    const { creatorId, quizId } = req.params;

    validateId(creatorId, "creator");
    validateId(quizId, "quiz");

    const quiz = await Quiz.findOne({
      _id: quizId,
      createdBy: creatorId
    });

    if (!quiz) {
      return res.status(404).json({
        status: "fail",
        message: "Quiz not found for this quiz creator"
      });
    }

    return res.status(200).json({
      status: "success",
      data: quiz
    });

  } catch (err) {
    if (err && err.name === "CastError") {
      return res.status(400).json({
        error: "CastError",
        message: err.message
      });
    }

    next(err);
  }
};

// --------------------------------------------------------
// DELETE QUIZ
// DELETE /api/v1/quizcreators/:creatorId/quizzes/:quizId
// --------------------------------------------------------
exports.deleteQuiz = async (req, res, next) => {
  try {
    const { creatorId, quizId } = req.params;

    validateId(creatorId, "creator");
    validateId(quizId, "quiz");

    const deleted = await Quiz.findOneAndDelete({
      _id: quizId,
      createdBy: creatorId
    });

    if (!deleted) {
      return res.status(404).json({
        status: "fail",
        message: "Quiz not found for this quiz creator"
      });
    }

    return res.status(204).send();

  } catch (err) {
    if (err && err.name === "CastError") {
      return res.status(400).json({
        error: "CastError",
        message: err.message
      });
    }

    next(err);
  }
};
