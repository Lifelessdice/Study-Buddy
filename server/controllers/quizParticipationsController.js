const mongoose = require('mongoose');
const QuizParticipation = require('../models/quizparticipations');
const User = require('../models/users');
const Quiz = require('../models/quizzes');

/**
 * Helper: validate student + quiz exist and student has role 'student'
 * Returns { student, quiz } or throws to be handled by caller
 */
async function validateStudentAndQuiz(studentId, quizId) {
  // validate ids first
  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    const err = new Error('Invalid student id format');
    err.name = 'CastError';
    throw err;
  }
  if (!mongoose.Types.ObjectId.isValid(quizId)) {
    const err = new Error('Invalid quiz id format');
    err.name = 'CastError';
    throw err;
  }

  const student = await User.findOne({ _id: studentId, role: 'student' });
  if (!student) {
    const err = new Error('Student not found');
    err.name = 'NotFound';
    throw err;
  }

  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    const err = new Error('Quiz not found');
    err.name = 'NotFound';
    throw err;
  }

  return { student, quiz };
}

// ------------------------------------------------------
// Create a participation entry
// POST /api/v1/quizparticipations
// ------------------------------------------------------
exports.createParticipation = async (req, res, next) => {
  try {
    const { student, quiz, answers, score } = req.body;

    // Required fields check for POST - explicit ValidationError shape
    if (!student) {
      const err = new Error('Student is required');
      err.name = 'ValidationError';
      throw err;
    }
    if (!quiz) {
      const err = new Error('Quiz is required');
      err.name = 'ValidationError';
      throw err;
    }

    // Validate existence and formats
    await validateStudentAndQuiz(student, quiz);

    // Create - duplicate key (unique index) will throw code 11000 from Mongo
    const participation = await QuizParticipation.create({
      student,
      quiz,
      answers,
      score,
    });

    res.status(201).json({
      status: 'success',
      data: participation,
    });
  } catch (err) {
    // Duplicate key -> 409 Conflict
    if (err && err.code === 11000) {
      return res.status(409).json({
        error: 'DuplicateKey',
        message: 'A participation for this student and quiz already exists',
      });
    }

    // Mongoose validation errors (schema-level)
    if (err && err.name === 'ValidationError') {
      return res.status(400).json({
        error: 'ValidationError',
        message: err.message,
      });
    }

    // our helper uses name 'CastError' for invalid id format
    if (err && err.name === 'CastError') {
      return res.status(400).json({
        error: 'CastError',
        message: err.message || 'Invalid ID format',
      });
    }

    // helper throws NotFound
    if (err && err.name === 'NotFound') {
      return res.status(404).json({
        status: 'fail',
        message: err.message,
      });
    }

    next(err);
  }
};

// ------------------------------------------------------
// List all participations, optional filters: student &/or quiz
// GET /api/v1/quizparticipations
// ------------------------------------------------------
exports.getAllParticipations = async (req, res, next) => {
  try {
    const filter = {};
    // If filters present, validate ObjectId format
    if (req.query.student) {
      if (!mongoose.Types.ObjectId.isValid(req.query.student)) {
        return res.status(400).json({
          error: 'CastError',
          message: 'Invalid student id format',
        });
      }
      filter.student = req.query.student;
    }
    if (req.query.quiz) {
      if (!mongoose.Types.ObjectId.isValid(req.query.quiz)) {
        return res.status(400).json({
          error: 'CastError',
          message: 'Invalid quiz id format',
        });
      }
      filter.quiz = req.query.quiz;
    }

    const list = await QuizParticipation.find(filter)
      .populate('student', 'name email')
      .populate({
        path: 'quiz',
        select: 'title course',
        populate: { path: 'course', select: 'name code' }
      });

    res.status(200).json({
      status: 'success',
      results: list.length,
      data: list,
    });
  } catch (err) {
    next(err);
  }
};

// ------------------------------------------------------
// Get a single participation by ID
// GET /api/v1/quizparticipations/:id
// ------------------------------------------------------
exports.getParticipationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'CastError',
        message: 'Invalid ID format',
      });
    }

    const part = await QuizParticipation.findById(id)
      .populate('student', 'name email')
      .populate({
        path: 'quiz',
        select: 'title course',
        populate: { path: 'course', select: 'name code' }
      });
    if (!part) {
      return res.status(404).json({
        status: 'fail',
        message: 'Quiz participation not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: part,
    });
  } catch (err) {
    next(err);
  }
};

// ------------------------------------------------------
// Delete a participation by ID
// DELETE /api/v1/quizparticipations/:id
// ------------------------------------------------------
exports.deleteParticipation = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'CastError',
        message: 'Invalid ID format',
      });
    }

    const deleted = await QuizParticipation.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        status: 'fail',
        message: 'Quiz participation not found',
      });
    }

    // no content
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
