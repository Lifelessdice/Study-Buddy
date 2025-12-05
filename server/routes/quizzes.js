const express = require('express');
const router = express.Router();
const quizzesController = require('../controllers/quizzesController');
const protect = require('../middleware/protect');

// POST /api/v1/quizzes
router.post('/', protect, quizzesController.createQuiz);

// GET /api/v1/quizzes
router.get('/', quizzesController.getAllQuizzes);

// GET /api/v1/quizzes/:id
router.get('/:id', quizzesController.getQuizById);

// PATCH /api/v1/quizzes/:id
router.patch('/:id', protect, quizzesController.updateQuiz);

// DELETE /api/v1/quizzes/:id
router.delete('/:id', protect, quizzesController.deleteQuiz);

// DELETE /api/v1/quizzes
router.delete('/', protect, quizzesController.deleteAllQuizzes);

// PUT /api/v1/quizzes/:id
router.put('/:id', protect, quizzesController.replaceQuiz);

module.exports = router;
