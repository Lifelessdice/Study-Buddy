const User = require('../models/users');
const Quiz = require('../models/quizzes');

// Helper to find quiz creator
async function findQuizCreatorOr404(creatorId, res) {
  const creator = await User.findOne({ _id: creatorId, role: 'teacher' });
  if (!creator) {
    res.status(404).json({ status: 'fail', message: 'Quiz creator not found' });
    return null;
  }
  return creator;
}

// Create a quiz
exports.createQuiz = async (req, res, next) => {
  try {
    const { creatorId } = req.params;
    const creator = await findQuizCreatorOr404(creatorId, res);
    if (!creator) return;

    const { createdBy, ...rest } = req.body;

    const quiz = await Quiz.create({ ...rest, createdBy: creator._id });

    res.status(201).json({ status: 'success', data: quiz });
  } catch (err) {
    next(err);
  }
};

// Get all quizzes for a creator
exports.getQuizzes = async (req, res, next) => {
  try {
    const { creatorId } = req.params;
    const creator = await findQuizCreatorOr404(creatorId, res);
    if (!creator) return;

    const quizzes = await Quiz.find({ createdBy: creator._id });

    res.status(200).json({ status: 'success', results: quizzes.length, data: quizzes });
  } catch (err) {
    next(err);
  }
};

// Get a specific quiz
exports.getQuizById = async (req, res, next) => {
  try {
    const { creatorId, quizId } = req.params;
    const quiz = await Quiz.findOne({ _id: quizId, createdBy: creatorId });

    if (!quiz) {
      return res.status(404).json({ status: 'fail', message: 'Quiz not found for this quiz creator' });
    }

    res.status(200).json({ status: 'success', data: quiz });
  } catch (err) {
    next(err);
  }
};

// Delete a quiz
exports.deleteQuiz = async (req, res, next) => {
  try {
    const { creatorId, quizId } = req.params;
    const deletedQuiz = await Quiz.findOneAndDelete({ _id: quizId, createdBy: creatorId });

    if (!deletedQuiz) {
      return res.status(404).json({ status: 'fail', message: 'Quiz not found for this quiz creator' });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
