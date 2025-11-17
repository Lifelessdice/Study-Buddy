// routes/quizzes.js
const express = require('express');
const Quiz = require('../models/quizzes');
const router = express.Router();

// ---------------------------------------------
//  POST /api/v1/quizzes  (FR4.2 – create quiz)
// ---------------------------------------------
router.post('/', async (req, res, next) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json({
      status: 'success',
      data: quiz,
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------
//  GET /api/v1/quizzes
//  FR4.3: List all quizzes (Read – collection)
// ---------------------------------------------
router.get('/', async (req, res, next) => {
  try {
    // later you can do .find().populate('course createdBy') if you want
    const quizzes = await Quiz.find();

    res.status(200).json({
      status: 'success',
      results: quizzes.length,
      data: quizzes,
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------
//  GET /api/v1/quizzes/:id
//  FR4.3: Fetch a single quiz by ID (Read – detail)
// ---------------------------------------------
router.get('/:id', async (req, res, next) => {
  try {
    // again, later you might want: Quiz.findById(req.params.id).populate('course createdBy')
    const quiz = await Quiz.findById(req.params.id);

    // Valid ObjectId but no quiz found
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
    // Invalid ObjectId -> CastError -> handled by global error middleware in app.js
    next(err);
  }
});

module.exports = router;
