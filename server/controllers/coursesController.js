const Course = require("../models/courses");

// CREATE
exports.createCourse = async (req, res, next) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json({ status: "success", data: course });
  } catch (err) {
    next(err);
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
    const course = await Course.findById(req.params.id);

    if (!course)
      return res.status(404).json({ status: "fail", message: "Course not found" });

    res.status(200).json({ status: "success", data: course });
  } catch (err) {
    next(err);
  }
};

// UPDATE (PATCH)
exports.updateCourse = async (req, res, next) => {
  try {
    const updated = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updated)
      return res.status(404).json({ status: "fail", message: "Course not found" });

    res.status(200).json({ status: "success", data: updated });
  } catch (err) {
    next(err);
  }
};

// FULL REPLACE (PUT)
exports.replaceCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course)
      return res.status(404).json({ status: "fail", message: "Course not found" });

    const { _id, ...rest } = req.body;

    course.overwrite(rest);
    await course.save();

    res.status(200).json({ status: "success", data: course });
  } catch (err) {
    next(err);
  }
};

// DELETE ONE
exports.deleteCourse = async (req, res, next) => {
  try {
    const deleted = await Course.findByIdAndDelete(req.params.id);

    if (!deleted)
      return res.status(404).json({ status: "fail", message: "Course not found" });

    res.status(204).send();
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
