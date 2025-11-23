const QuizParticipation = require('../models/quizparticipations');
const User = require('../models/users');
const Quiz = require('../models/quizzes');

// Helper to validate student + quiz
async function validateStudentAndQuiz(studentId, quizId) {
  const student = await User.findOne({ _id: studentId, role: 'student' });
  if (!student) {
    return { error: 'Student not found' };
  }

  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    return { error: 'Quiz not found' };
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

    const result = await validateStudentAndQuiz(student, quiz);
    if (result.error) {
      return res.status(404).json({
        status: 'fail',
        message: result.error,
      });
    }

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
    if (req.query.student) filter.student = req.query.student;
    if (req.query.quiz) filter.quiz = req.query.quiz;

    const list = await QuizParticipation.find(filter);

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
    const part = await QuizParticipation.findById(req.params.id);
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
    const deleted = await QuizParticipation.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        status: 'fail',
        message: 'Quiz participation not found',
      });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
