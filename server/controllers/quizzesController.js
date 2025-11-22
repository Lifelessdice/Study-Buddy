const Quiz = require('../models/quizzes');

// ---------------------------------------------
// Create a new quiz
// ---------------------------------------------
exports.createQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json({
      status: 'success',
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
    // You can later populate course/createdBy if needed
    const quizzes = await Quiz.find();

    res.status(200).json({
      status: 'success',
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
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        status: 'fail',
        message: 'Quiz not found',
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

// ---------------------------------------------
// Update a quiz by ID (PATCH)
// ---------------------------------------------
exports.updateQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!quiz) {
      return res.status(404).json({
        status: 'fail',
        message: 'Quiz not found',
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

// ---------------------------------------------
// Delete a quiz by ID
// ---------------------------------------------
exports.deleteQuiz = async (req, res, next) => {
  try {
    const deletedQuiz = await Quiz.findByIdAndDelete(req.params.id);

    if (!deletedQuiz) {
      return res.status(404).json({
        status: 'fail',
        message: 'Quiz not found',
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

// ---------------------------------------------
// Full replace a quiz (PUT)
// ---------------------------------------------
exports.replaceQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        status: 'fail',
        message: 'Quiz not found',
      });
    }

    const { _id, ...rest } = req.body;
    quiz.overwrite(rest);

    await quiz.save();

    res.status(200).json({
      status: 'success',
      data: quiz,
    });
  } catch (err) {
    next(err);
  }
};
