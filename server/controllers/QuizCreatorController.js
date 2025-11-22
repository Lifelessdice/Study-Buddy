const User = require('../models/users');
const Quiz = require('../models/quizzes');

// Helper to validate quiz creator (role: teacher)
async function findQuizCreator(creatorId) {
  const creator = await User.findOne({ _id: creatorId, role: 'teacher' });
  if (!creator) return { error: 'Quiz creator not found' };
  return { creator };
}

// ------------------------------------------------------
// Create a quiz for a specific quiz creator
// POST /api/v1/quizcreators/:creatorId/quizzes
// ------------------------------------------------------
exports.createQuizForCreator = async (req, res, next) => {
  try {
    const { creatorId } = req.params;
    const { creator, error } = await findQuizCreator(creatorId);
    if (error) {
      return res.status(404).json({ status: 'fail', message: error });
    }

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
};

// ------------------------------------------------------
// List all quizzes created by this creator
// GET /api/v1/quizcreators/:creatorId/quizzes
// ------------------------------------------------------
exports.getQuizzesByCreator = async (req, res, next) => {
  try {
    const { creatorId } = req.params;
    const { creator, error } = await findQuizCreator(creatorId);
    if (error) {
      return res.status(404).json({ status: 'fail', message: error });
    }

    const quizzes = await Quiz.find({ createdBy: creator._id });

    res.status(200).json({
      status: 'success',
      results: quizzes.length,
      data: quizzes,
    });
  } catch (err) {
    next(err);
  }
};

// ------------------------------------------------------
// Get a specific quiz if it belongs to the creator
// GET /api/v1/quizcreators/:creatorId/quizzes/:quizId
// ------------------------------------------------------
exports.getQuizByCreator = async (req, res, next) => {
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
};

// ------------------------------------------------------
// Delete a quiz only if it belongs to this creator
// DELETE /api/v1/quizcreators/:creatorId/quizzes/:quizId
// ------------------------------------------------------
exports.deleteQuizByCreator = async (req, res, next) => {
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

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
