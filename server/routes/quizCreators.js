const express = require('express');
const quizController = require('../controllers/QuizCreatorController');
const protect = require('../middleware/protect');

const router = express.Router();

// Routes
router.post('/:creatorId/quizzes', protect, quizController.createQuiz);
router.get('/:creatorId/quizzes', quizController.getQuizzesByCreator);
router.get('/:creatorId/quizzes/:quizId', quizController.getQuizById);
router.delete('/:creatorId/quizzes/:quizId', protect, quizController.deleteQuiz);

module.exports = router;
