// routes/courses.js
const express = require('express');
const Course = require('../models/courses'); 
const router = express.Router();

// ---------------------------------------------
//  POST /api/v1/courses  (Create a new course)
// ---------------------------------------------
router.post('/', async (req, res, next) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
    } catch (err) {
    next(err); // handled by global error handler in app.js
    }
});

module.exports = router;