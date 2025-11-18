// routes/courses.js
const express = require('express');
const Course = require('../models/courses');
const router = express.Router();

// ---------------------------------------------
//  POST /api/v1/courses  (Create a new course) – FR4.2
// ---------------------------------------------
router.post('/', async (req, res, next) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json({
      status: 'success',
      data: course,
    });
  } catch (err) {
    next(err); // handled by global error handler in app.js
  }
});

// ---------------------------------------------
//  GET /api/v1/courses
//  FR4.3: List all courses (Read – collection)
// ---------------------------------------------
router.get('/', async (req, res, next) => {
  try {
    // Later: FR9 filtering/sorting/pagination can hook into this
    const courses = await Course.find();

    res.status(200).json({
      status: 'success',
      results: courses.length,
      data: courses,
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------
//  GET /api/v1/courses/:id
//  FR4.3: Fetch a single course by ID (Read – detail)
// ---------------------------------------------
router.get('/:id', async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    // Valid ObjectId but no record found
    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'Course not found',
      });
    }

    // Course found
    res.status(200).json({
      status: 'success',
      data: course,
    });
  } catch (err) {
    // Invalid ObjectId (CastError) or other errors handled globally
    next(err);
  }
});


// ----------------------------------------------
// PATCH /api/v1/courses/:id
// FR4.4: Update course by ID (Update - detail)
router.patch('/:id', async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'Course not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: course,
    });
  } catch (err) {
    next(err);
  } 
});


//----------------------------------------------
// DELETE /api/v1/courses/:id
// FR4.5: Delete course by ID (Delete - detail)
//----------------------------------------------
router.delete('/:id', async (req, res, next) => {
  try {
    const deletedcourse = await Course.findByIdAndDelete(req.params.id);

    if (!deletedcourse) {
      return res.status(404).json({
        status: 'fail',
        message: 'Course not found',
      });
    }

    //204 No Content - no response body
    return res.status(204).send();
  } catch (err) {
    next(err);
  } 
});


//----------------------------------------------
// DELETE /api/v1/courses
// DELETE all courses
//----------------------------------------------
router.delete('/', async (req, res, next) => {
  try {
    await Course.deleteMany({});
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
