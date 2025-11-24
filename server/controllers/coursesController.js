const mongoose = require("mongoose");
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
    const { id } = req.params;

    // Invalid ObjectId → 400 CastError
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "CastError",
        message: "Invalid ID format"
      });
    }

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        status: "fail",
        message: "Course not found"
      });
    }

    res.status(200).json({ status: "success", data: course });
  } catch (err) {
    next(err);
  }
};

// UPDATE (PATCH)
exports.updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "CastError",
        message: "Invalid ID format"
      });
    }

    const updated = await Course.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updated) {
      return res.status(404).json({
        status: "fail",
        message: "Course not found"
      });
    }

    res.status(200).json({ status: "success", data: updated });
  } catch (err) {
    next(err);
  }
};

// FULL REPLACE (PUT)
exports.replaceCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Step 1: Invalid ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "CastError",
        message: "Invalid ID format"
      });
    }

    // Step 2: Check if course exists
    const existing = await Course.findById(id);

    if (!existing) {
      return res.status(404).json({
        status: "fail",
        message: "Course not found"
      });
    }

    // Step 3: Required fields check for PUT
  if (!req.body.code) {
    const err = new Error("Course code is required");
    err.name = "ValidationError";
    throw err;
  }

  if (!req.body.name) {
    const err = new Error("Course name is required");
    err.name = "ValidationError";
    throw err;
  }


    // Step 4: Apply overwrite with validation
    existing.overwrite(req.body);
    await existing.save({ validateBeforeSave: true });

    res.status(200).json({
      status: "success",
      data: existing
    });

  } catch (err) {
    next(err);
  }
};

// DELETE ONE
exports.deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Invalid ID → 400
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "CastError",
        message: "Invalid ID format"
      });
    }

    const deleted = await Course.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        status: "fail",
        message: "Course not found"
      });
    }

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
