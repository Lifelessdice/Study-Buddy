const express = require('express');
const router = express.Router();
const quizCreatorsController = require('../controllers/quizCreatorsController');

// POST /api/v1/quizcreators/:creatorId/quizzes
router.post('/:creatorId/quizzes', quizCreatorsController.createQuizForCreator);

// GET /api/v1/quizcreators/:creatorId/quizzes
router.get('/:creatorId/quizzes', quizCreatorsController.getQuizzesByCreator);

// GET /api/v1/quizcreators/:creatorId/quizzes/:quizId
router.get('/:creatorId/quizzes/:quizId', quizCreatorsController.getQuizByCreator);

// DELETE /api/v1/quizcreators/:creatorId/quizzes/:quizId
router.delete('/:creatorId/quizzes/:quizId', quizCreatorsController.deleteQuizByCreator);

module.exports = router;
