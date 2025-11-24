const mongoose = require("mongoose");
const TeachingAssignment = require("../models/teachingAssignments");
const Course = require("../models/courses");
const User = require("../models/users");

// Helper to validate ObjectId
function validateId(id, label) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error(`Invalid ${label} id format`);
    err.name = "CastError";
    throw err;
  }
}

// ---------------------------------------------------------
// Create a teaching assignment
// POST /api/v1/courses/:courseId/teachingAssignments
// ---------------------------------------------------------
exports.createAssignment = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { teacher } = req.body;

    // Validate IDs
    validateId(courseId, "course");

    if (!teacher) {
      const err = new Error("Teacher is required");
      err.name = "ValidationError";
      throw err;
    }

    validateId(teacher, "teacher");

    // Check course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        status: "fail",
        message: "Course not found"
      });
    }

    // Check teacher exists AND is teacher role
    const user = await User.findOne({ _id: teacher, role: "teacher" });
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "Teacher (user) not found"
      });
    }

    // Create assignment (duplicate → 11000 error)
    const assignment = await TeachingAssignment.create({
      course: courseId,
      teacher
    });

    res.status(201).json({
      status: "success",
      data: assignment
    });

  } catch (err) {
    // Duplicate teacher+course assignment
    if (err && err.code === 11000) {
      return res.status(409).json({
        error: "DuplicateKey",
        message: "Teacher is already assigned to this course"
      });
    }

    if (err && err.name === "ValidationError") {
      return res.status(400).json({
        error: "ValidationError",
        message: err.message
      });
    }

    if (err && err.name === "CastError") {
      return res.status(400).json({
        error: "CastError",
        message: err.message
      });
    }

    next(err);
  }
};

// ---------------------------------------------------------
// List teaching assignments for a course
// GET /api/v1/courses/:courseId/teachingAssignments
// ---------------------------------------------------------
exports.getAllAssignments = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    validateId(courseId, "course");

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        status: "fail",
        message: "Course not found"
      });
    }

    const assignments = await TeachingAssignment.find({ course: courseId })
      .populate("teacher")
      .exec();

    res.status(200).json({
      status: "success",
      results: assignments.length,
      data: assignments
    });

  } catch (err) {
    if (err && err.name === "CastError") {
      return res.status(400).json({
        error: "CastError",
        message: err.message
      });
    }
    next(err);
  }
};

// ---------------------------------------------------------
// Get single assignment
// GET /api/v1/courses/:courseId/teachingAssignments/:assignmentId
// ---------------------------------------------------------
exports.getAssignmentById = async (req, res, next) => {
  try {
    const { courseId, assignmentId } = req.params;

    validateId(courseId, "course");
    validateId(assignmentId, "assignment");

    const assignment = await TeachingAssignment.findOne({
      _id: assignmentId,
      course: courseId
    }).populate("teacher");

    if (!assignment) {
      return res.status(404).json({
        status: "fail",
        message: "Teaching assignment not found for this course"
      });
    }

    res.status(200).json({
      status: "success",
      data: assignment
    });

  } catch (err) {
    if (err && err.name === "CastError") {
      return res.status(400).json({
        error: "CastError",
        message: err.message
      });
    }
    next(err);
  }
};

// ---------------------------------------------------------
// Delete assignment
// DELETE /api/v1/courses/:courseId/teachingAssignments/:assignmentId
// ---------------------------------------------------------
exports.deleteAssignment = async (req, res, next) => {
  try {
    const { courseId, assignmentId } = req.params;

    validateId(courseId, "course");
    validateId(assignmentId, "assignment");

    const deleted = await TeachingAssignment.findOneAndDelete({
      _id: assignmentId,
      course: courseId
    });

    if (!deleted) {
      return res.status(404).json({
        status: "fail",
        message: "Teaching assignment not found for this course"
      });
    }

    return res.status(204).send();

  } catch (err) {
    if (err && err.name === "CastError") {
      return res.status(400).json({
        error: "CastError",
        message: err.message
      });
    }
    next(err);
  }
};
