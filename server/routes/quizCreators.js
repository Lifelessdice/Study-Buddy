const express = require('express');
const quizController = require('../controllers/QuizCreatorController');

const router = express.Router();

// Routes
router.post('/:creatorId/quizzes', quizController.createQuiz);
router.get('/:creatorId/quizzes', quizController.getQuizzesByCreator);
router.get('/:creatorId/quizzes/:quizId', quizController.getQuizById);
router.delete('/:creatorId/quizzes/:quizId', quizController.deleteQuiz);

module.exports = router;
