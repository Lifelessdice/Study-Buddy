// controllers/coursesController.js
const Course = require('../models/courses');

// Helper for missing fields
const missingFieldsMessage = (fields) =>
  `Missing required field${fields.length > 1 ? 's' : ''}: ${fields.join(', ')}`;

// ---------------------
// CREATE
// ---------------------
exports.createCourse = async (req, res, next) => {
  try {
    const { name, code, material, degree } = req.body;

    const missing = [];
    if (!name) missing.push('name');
    if (!code) missing.push('code');

    if (missing.length) {
      const err = new Error(missingFieldsMessage(missing));
      err.name = "ValidationError";
      throw err;
    }

    const course = await Course.create({ name, code, material, degree });

    return res.status(201).json({ status: 'success', data: course });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: "ValidationError" });
    }
    next(err);
  }
};

// ---------------------
// LIST
// ---------------------
exports.listCourses = async (req, res, next) => {
  try {
    const courses = await Course.find();
    return res.status(200).json({
      status: 'success',
      results: courses.length,
      data: courses,
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------
// GET by ID
// ---------------------
exports.getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ status: 'fail', message: 'Course not found' });
    }

    return res.status(200).json({ status: 'success', data: course });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: "CastError" });
    }
    next(err);
  }
};

// ---------------------
// PUT (full replace)
// ---------------------
exports.replaceCourse = async (req, res, next) => {
  try {
    // FIRST: Check if course exists
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        error: "NotFound",
        message: "Course not found",
      });
    }

    // THEN: Validate required fields
    const { name, code } = req.body;
    const missing = [];
    if (!name) missing.push("name");
    if (!code) missing.push("code");

    if (missing.length) {
      const err = new Error(missingFieldsMessage(missing));
      err.name = "ValidationError";
      throw err;
    }

    // Apply overwrite
    const { _id, ...rest } = req.body;
    course.overwrite(rest);

    await course.save(); // triggers Mongoose validators

    return res.status(200).json({ status: "success", data: course });

  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: "ValidationError" });
    }
    if (err.name === "CastError") {
      return res.status(400).json({ error: "CastError" });
    }
    next(err);
  }
};

// ---------------------
// PATCH (partial update)
// ---------------------
exports.updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({
        status: "fail",
        message: "Course not found"
      });
    }

    return res.status(200).json({
      status: "success",
      data: course
    });

  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ error: "CastError" });
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: "ValidationError" });
    }
    next(err);
  }
};

// ---------------------
// DELETE single
// ---------------------
exports.deleteCourse = async (req, res, next) => {
  try {
    const deleted = await Course.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ status: 'fail', message: 'Course not found' });
    }

    return res.status(204).send();
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ error: "CastError" });
    }
    next(err);
  }
};

// ---------------------
// DELETE all
// ---------------------
exports.deleteAllCourses = async (req, res, next) => {
  try {
    await Course.deleteMany({});
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};
