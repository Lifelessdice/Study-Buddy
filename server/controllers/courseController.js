// controllers/coursesController.js
const Course = require('../models/courses');

const missingFieldsMessage = (fields) =>
  `Missing required field${fields.length > 1 ? 's' : ''}: ${fields.join(', ')}`;

// CREATE
exports.createCourse = async (req, res, next) => {
  try {
    const { name, code, material, degree } = req.body;

    // explicit required-field validation -> 400 Bad Request
    const missing = [];
    if (!name) missing.push('name');
    if (!code) missing.push('code');
    if (missing.length) {
      return res.status(400).json({
        status: 'fail',
        message: missingFieldsMessage(missing),
      });
    }

    const course = await Course.create({ name, code, material, degree });
    return res.status(201).json({
      status: 'success',
      data: course,
    });
  } catch (err) {
    next(err);
  }
};

// LIST
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

// GET by id
exports.getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ status: 'fail', message: 'Course not found' });
    }
    return res.status(200).json({ status: 'success', data: course });
  } catch (err) {
    next(err);
  }
};

// PUT (full replace)
exports.replaceCourse = async (req, res, next) => {
  try {
    // require required fields for full replace
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
    await course.save(); // will trigger Mongoose validators

    return res.status(200).json({ status: 'success', data: course });
  } catch (err) {
    next(err);
  }
};

// PATCH (partial update)
exports.updateCourse = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Request body is empty. Provide fields to update.',
      });
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

// DELETE by id
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

// DELETE all
exports.deleteAllCourses = async (req, res, next) => {
  try {
    await Course.deleteMany({});
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};
