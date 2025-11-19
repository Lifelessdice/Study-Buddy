const express = require('express');
const User = require('../models/users');
const Quiz = require('../models/quizzes');

const router = express.Router();

// Find a quiz creator (User with role 'teacher')
async function findQuizCreatorOr404(creatorId, res) {
  const creator = await User.findOne({ _id: creatorId, role: 'teacher' });

  if (!creator) {
    res.status(404).json({
      status: 'fail',
      message: 'Quiz creator not found',
    });
    return null;
  }

  return creator;
}

// ------------------------------------------------------
// POST /api/v1/quizcreators/:creatorId/quizzes
// Create a quiz for a specific quiz creator
// ------------------------------------------------------
router.post('/:creatorId/quizzes', async (req, res, next) => {
  try {
    const { creatorId } = req.params;

    const creator = await findQuizCreatorOr404(creatorId, res);
    if (!creator) return;

    const { createdBy, ...rest } = req.body;

    const quiz = await Quiz.create({
      ...rest,
      createdBy: creator._id,
    });

    res.status(201).json({
      status: 'success',
      data: quiz,
    });
  } catch (err) {
    next(err);
  }
});

// ------------------------------------------------------
// GET /api/v1/quizcreators/:creatorId/quizzes
// List all quizzes created by this creator
// ------------------------------------------------------
router.get('/:creatorId/quizzes', async (req, res, next) => {
  try {
    const { creatorId } = req.params;

    const creator = await findQuizCreatorOr404(creatorId, res);
    if (!creator) return;

    const quizzes = await Quiz.find({ createdBy: creator._id });

    res.status(200).json({
      status: 'success',
      results: quizzes.length,
      data: quizzes,
    });
  } catch (err) {
    next(err);
  }
});

// ------------------------------------------------------
// GET /api/v1/quizcreators/:creatorId/quizzes/:quizId
// Get a specific quiz if it belongs to the creator
// ------------------------------------------------------
router.get('/:creatorId/quizzes/:quizId', async (req, res, next) => {
  try {
    const { creatorId, quizId } = req.params;

    const quiz = await Quiz.findOne({
      _id: quizId,
      createdBy: creatorId,
    });

    if (!quiz) {
      return res.status(404).json({
        status: 'fail',
        message: 'Quiz not found for this quiz creator',
      });
    }

    res.status(200).json({
      status: 'success',
      data: quiz,
    });
  } catch (err) {
    next(err);
  }
});

// ------------------------------------------------------
// DELETE /api/v1/quizcreators/:creatorId/quizzes/:quizId
// Delete a quiz only if it belongs to this creator
// ------------------------------------------------------
router.delete('/:creatorId/quizzes/:quizId', async (req, res, next) => {
  try {
    const { creatorId, quizId } = req.params;

    const deletedQuiz = await Quiz.findOneAndDelete({
      _id: quizId,
      createdBy: creatorId,
    });

    if (!deletedQuiz) {
      return res.status(404).json({
        status: 'fail',
        message: 'Quiz not found for this quiz creator',
      });
    }

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
