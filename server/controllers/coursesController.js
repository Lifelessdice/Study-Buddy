const Course = require("../models/courses");
const mongoose = require('mongoose');


// Helper for missing fields
const missingFieldsMessage = (fields) =>
  `Missing required field${fields.length > 1 ? 's' : ''}: ${fields.join(', ')}`;

// CREATE
exports.createCourse = async (req, res, next) => {
  try {
    const { name, code } = req.body;
    const missing = [];
    if (!name) missing.push('name');
    if (!code) missing.push('code');
    if (missing.length) {
      return res.status(400).json({ status: 'fail', message: missingFieldsMessage(missing) });
    }

    const course = await Course.create(req.body);
    return res.status(201).json({ status: 'success', data: course });
  } catch (err) {
    next(err); // handled by global error handler in app.js
  }
};

// LIST ALL
exports.getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find();
    res.status(200).json({
      status: "success",
      results: courses.length,
      data: courses
    });
  } catch (err) {
    next(err);
  }
};

// GET BY ID
exports.getCourseById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid ID format' });
    }
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ status: 'fail', message: 'Course not found' });
    }
    return res.status(200).json({ status: 'success', data: course });
  } catch (err) {
    next(err);
  }
};

// UPDATE (PATCH)
exports.updateCourse = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ status: 'fail', message: 'Request body is empty' });
    }
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!course) {
      return res.status(404).json({ status: 'fail', message: 'Course not found' });
    }
    return res.status(200).json({ status: 'success', data: course });
  } catch (err) {
    next(err);
  }
};

// FULL REPLACE (PUT)
exports.replaceCourse = async (req, res, next) => {
  try {
    const { name, code } = req.body;
    const missing = [];
    if (!name) missing.push('name');
    if (!code) missing.push('code');
    if (missing.length) {
      return res.status(400).json({ status: 'fail', message: missingFieldsMessage(missing) });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ status: 'fail', message: 'Course not found' });
    }

    const { _id, ...rest } = req.body;
    course.overwrite(rest);
    await course.save();

    return res.status(200).json({ status: 'success', data: course });
  } catch (err) {
    next(err);
  }
};

// DELETE ONE
exports.deleteCourse = async (req, res, next) => {
  try {
    const deleted = await Course.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ status: 'fail', message: 'Course not found' });
    }
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// DELETE ALL
exports.deleteAllCourses = async (req, res, next) => {
  try {
    await Course.deleteMany({});
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
