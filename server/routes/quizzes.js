const express = require('express');
const Quiz = require('../models/quizzes');
const router = express.Router();

// ---------------------------------------------
//  POST /api/v1/quizzes  
// ---------------------------------------------
router.post('/', async (req, res, next) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json(quiz);
    } catch (err) {
        next(err);
    }
});

module.exports = router;