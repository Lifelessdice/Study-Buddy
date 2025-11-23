const express = require('express');
const quizController = require('../controllers/quizController');

const router = express.Router();

router.post('/:creatorId/quizzes', quizController.createQuiz);
router.get('/:creatorId/quizzes', quizController.getQuizzes);
router.get('/:creatorId/quizzes/:quizId', quizController.getQuizById);
router.delete('/:creatorId/quizzes/:quizId', quizController.deleteQuiz);

module.exports = router;
