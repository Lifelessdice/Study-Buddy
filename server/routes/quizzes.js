const express = require('express');
const router = express.Router();
const quizzesController = require('../controllers/quizzesController');

// POST /api/v1/quizzes
router.post('/', quizzesController.createQuiz);

// GET /api/v1/quizzes
router.get('/', quizzesController.getAllQuizzes);

// GET /api/v1/quizzes/:id
router.get('/:id', quizzesController.getQuizById);

// PATCH /api/v1/quizzes/:id
router.patch('/:id', quizzesController.updateQuiz);

// DELETE /api/v1/quizzes/:id
router.delete('/:id', quizzesController.deleteQuiz);

// DELETE /api/v1/quizzes
router.delete('/', quizzesController.deleteAllQuizzes);

// PUT /api/v1/quizzes/:id
router.put('/:id', quizzesController.replaceQuiz);

module.exports = router;
