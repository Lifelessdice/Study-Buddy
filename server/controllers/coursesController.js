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
    if (!name || !code) {
  let message = "";

  if (!code) {
    message = "Course code is required";
  } else {
    message = "Course name is required";
  }

  return res.status(400).json({
    error: "ValidationError",
    message
  });
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

// PUT (full replace)
exports.replaceCourse = async (req, res, next) => {
  try {
    const id = req.params.id;

    // First: validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        status: "fail",
        error: "CastError"
      });
    }

    // Second: check if course exists
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        status: "fail",
        message: "Course not found"
      });
    }

    // Third: check required fields for full replace
    const { name, code } = req.body;
    const missing = [];
    if (!name) missing.push("name");
    if (!code) missing.push("code");

    if (missing.length) {
      let message;
      if (missing.length === 1) {
        // return a more specific message for a single missing field
        message = missing[0] === 'code' ? 'Course code is required' : 'Course name is required';
      } else {
        message = `Missing required fields: ${missing.join(", ")}`;
      }

      return res.status(400).json({
        status: "fail",
        error: "ValidationError",
        message
      });
    }

    // Overwrite data
    const { _id, ...rest } = req.body;
    course.overwrite(rest);
    await course.save();

    return res.status(200).json({
      status: "success",
      data: course
    });

  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({
        status: "fail",
        error: "CastError"
      });
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({
        status: "fail",
        error: "ValidationError",
        message: err.message
      });
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
    return res.status(400).json({
      status: "fail",
      error: "CastError"
    });
  }
  if (err.name === "ValidationError") {
    return res.status(400).json({
      status: "fail",
      error: "ValidationError",
      message: err.message
    });
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
