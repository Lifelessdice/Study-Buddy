const express = require('express');
const router = express.Router();
const quizParticipationsController = require('../controllers/quizParticipationsController');

// POST /api/v1/quizparticipations
router.post('/', quizParticipationsController.createParticipation);

// GET /api/v1/quizparticipations
router.get('/', quizParticipationsController.getAllParticipations);

// GET /api/v1/quizparticipations/:id
router.get('/:id', quizParticipationsController.getParticipationById);

// DELETE /api/v1/quizparticipations/:id
router.delete('/:id', quizParticipationsController.deleteParticipation);

module.exports = router;
