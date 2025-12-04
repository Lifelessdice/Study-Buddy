const mongoose = require("mongoose");
const Course = require("../models/courses");
const TeachingAssignment = require("../models/teachingAssignments");

function normalizeCourseBody(body) {
  // Allow legacy "material" field to map into new "overview"
  if (body && body.material && !body.overview) {
    body.overview = body.material;
  }
}

function ensureRequiredFields(body) {
  const required = {
    name: "Course name is required",
    code: "Course code is required"
  };

  for (const [field, message] of Object.entries(required)) {
    const value = body[field];
    if (
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "")
    ) {
      const err = new Error(message);
      err.name = "ValidationError";
      throw err;
    }
  }
}

function ensureNonEmptyIfPresent(body, field, message) {
  if (Object.prototype.hasOwnProperty.call(body, field)) {
    const value = body[field];
    if (
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "")
    ) {
      const err = new Error(message);
      err.name = "ValidationError";
      throw err;
    }
  }
}

// CREATE
exports.createCourse = async (req, res, next) => {
  try {
    normalizeCourseBody(req.body);
    ensureRequiredFields(req.body);
    const course = await Course.create(req.body);

    // If a teacher is creating the course, auto-assign them
    if (req.user && req.user.role === "teacher") {
      try {
        await TeachingAssignment.create({
          course: course._id,
          teacher: req.user._id
        });
      } catch (assignErr) {
        // Ignore duplicate assignment errors
        if (!(assignErr && assignErr.code === 11000)) {
          console.warn("Failed to auto-assign teacher to course:", assignErr.message);
        }
      }
    }

    res.status(201).json({ status: "success", data: course });
  } catch (err) {
    next(err);
  }
};

// LIST ALL (with optional filters, basic pagination, and sorting)
exports.getCourses = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.name) {
      filter.name = { $regex: req.query.name, $options: 'i' };
    }
    if (req.query.code) {
      filter.code = { $regex: req.query.code, $options: 'i' };
    }
    if (req.query.degree) {
      filter.degree = req.query.degree;
    }

    // Basic pagination
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 5, 1);
    const skip = (page - 1) * limit;

    const sort = req.query.sort || '-createdAt';

    const [courses, total] = await Promise.all([
      Course.find(filter).sort(sort).skip(skip).limit(limit),
      Course.countDocuments(filter)
    ]);

    // collect unique degrees in this result set
    const degreeSet = new Set();
    courses.forEach(c => {
      if (c.degree) degreeSet.add(c.degree);
    });

    res.status(200).json({
      status: "success",
      page,
      limit,
      total,
      results: courses.length,
      degrees: Array.from(degreeSet),
      data: courses
    });
  } catch (err) {
    next(err);
  }
};

// LIST courses for the logged-in teacher
exports.getMyCourses = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: "fail", message: "Not authenticated" });
    }

    if (req.user.role !== "teacher") {
      return res.status(403).json({ status: "fail", message: "Only teachers can view their courses" });
    }

    const assignments = await TeachingAssignment.find({ teacher: req.user._id }).populate("course");
    const courses = assignments
      .map(a => a.course)
      .filter(Boolean);

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

    ensureNonEmptyIfPresent(req.body, "name", "Course name is required");
    ensureNonEmptyIfPresent(req.body, "code", "Course code is required");
    normalizeCourseBody(req.body);

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
    ensureRequiredFields(req.body);
    normalizeCourseBody(req.body);

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
