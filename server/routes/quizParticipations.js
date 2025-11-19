const express = require('express');
const QuizParticipation = require('../models/quizparticipations');
const User = require('../models/users');
const Quiz = require('../models/quizzes');

const router = express.Router();

// Helper to validate student + quiz
async function validateStudentAndQuiz(studentId, quizId, res) {
  const student = await User.findOne({ _id: studentId, role: 'student' });
  if (!student) {
    res.status(404).json({
      status: 'fail',
      message: 'Student not found',
    });
    return null;
  }

  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    res.status(404).json({
      status: 'fail',
      message: 'Quiz not found',
    });
    return null;
  }

  return { student, quiz };
}

// ------------------------------------------------------
// POST /api/v1/quizparticipations
// Create a participation entry
// ------------------------------------------------------
router.post('/', async (req, res, next) => {
  try {
    const { student, quiz, answers, score } = req.body;

    const result = await validateStudentAndQuiz(student, quiz, res);
    if (!result) return;

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
});

// ------------------------------------------------------
// GET /api/v1/quizparticipations
// Optional filters: ?student=<id> &/or ?quiz=<id>
// ------------------------------------------------------
router.get('/', async (req, res, next) => {
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
});

// ------------------------------------------------------
// GET /api/v1/quizparticipations/:id
//-------------------------------------------------------
router.get('/:id', async (req, res, next) => {
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
});

// ------------------------------------------------------
// DELETE /api/v1/quizparticipations/:id
//------------------------------------------------------
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await QuizParticipation.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        status: 'fail',
        message: 'Quiz participation not found',
      });
    }

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
