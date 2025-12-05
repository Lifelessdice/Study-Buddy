const express = require('express');
const router = express.Router();
const quizParticipationsController = require('../controllers/quizParticipationsController');
const protect = require('../middleware/protect');

// POST /api/v1/quizparticipations
router.post('/', protect, quizParticipationsController.createParticipation);

// GET /api/v1/quizparticipations
router.get('/', quizParticipationsController.getAllParticipations);

// GET /api/v1/quizparticipations/:id
router.get('/:id', quizParticipationsController.getParticipationById);

// DELETE /api/v1/quizparticipations/:id
router.delete('/:id', protect, quizParticipationsController.deleteParticipation);

module.exports = router;
