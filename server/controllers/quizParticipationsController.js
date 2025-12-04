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

// ------------------------------------------------------
// Get aggregated analytics for a student's quiz history
// GET /api/v1/quizparticipations/student/:studentId/analytics
// ------------------------------------------------------
exports.getStudentAnalytics = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        error: "CastError",
        message: "Invalid student id format"
      });
    }

    const list = await QuizParticipation.find({ student: studentId })
      .populate({
        path: "quiz",
        select: "title course",
        populate: { path: "course", select: "name code" }
      });

    const totalQuizzes = list.length;
    const scores = list.map((p) => (typeof p.score === "number" ? p.score : 0));
    const sum = scores.reduce((a, b) => a + b, 0);
    const averageScore = totalQuizzes > 0 ? sum / totalQuizzes : 0;
    const highestScore = totalQuizzes > 0 ? Math.max(...scores) : 0;
    const lowestScore = totalQuizzes > 0 ? Math.min(...scores) : 0;

    // Build a simple history timeline sorted by createdAt
    const history = list
      .slice()
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map((p) => ({
        id: p._id,
        quizId: p.quiz?._id,
        quizTitle: p.quiz?.title,
        courseName: p.quiz?.course?.name,
        courseCode: p.quiz?.course?.code,
        score: p.score,
        takenAt: p.createdAt
      }));

    res.status(200).json({
      status: "success",
      data: {
        studentId,
        totalQuizzes,
        averageScore,
        highestScore,
        lowestScore,
        history
      }
    });
  } catch (err) {
    next(err);
  }
};

