const mongoose = require("mongoose");
const CourseAttendance = require("../models/courseAttendances");
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

// ---------------------------------------------
// Create attendance
// POST /api/v1/courses/:courseId/attendances
// ---------------------------------------------
exports.createAttendance = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { student } = req.body;

    // Validate IDs
    validateId(courseId, "course");

    if (!student) {
      const err = new Error("Student is required");
      err.name = "ValidationError";
      throw err;
    }

    validateId(student, "student");

    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        status: "fail",
        message: "Course not found",
      });
    }

    // Validate student exists + is student role
    const user = await User.findOne({ _id: student, role: "student" });
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "Student (user) not found",
      });
    }

    // Create attendance (duplicate enrollment → error 11000)
    const attendance = await CourseAttendance.create({
      course: courseId,
      student: student,
    });

    return res.status(201).json({
      status: "success",
      data: attendance,
    });
  } catch (err) {
    // Duplicate unique index (course + student)
    if (err && err.code === 11000) {
      return res.status(409).json({
        error: "DuplicateKey",
        message: "Student already has attendance for this course",
      });
    }

    if (err && err.name === "ValidationError") {
      return res.status(400).json({
        error: "ValidationError",
        message: err.message,
      });
    }

    if (err && err.name === "CastError") {
      return res.status(400).json({
        error: "CastError",
        message: err.message,
      });
    }

    next(err);
  }
};

// ---------------------------------------------
// List attendance for a course
// GET /api/v1/courses/:courseId/attendances
// ---------------------------------------------
exports.getAllAttendances = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    validateId(courseId, "course");

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        status: "fail",
        message: "Course not found",
      });
    }

    const attendances = await CourseAttendance.find({ course: courseId })
      .populate("student")
      .exec();

    res.status(200).json({
      status: "success",
      results: attendances.length,
      data: attendances,
    });
  } catch (err) {
    if (err && err.name === "CastError") {
      return res.status(400).json({
        error: "CastError",
        message: err.message,
      });
    }
    next(err);
  }
};

// ---------------------------------------------
// Get single attendance record
// GET /api/v1/courses/:courseId/attendances/:attendanceId
// ---------------------------------------------
exports.getAttendanceById = async (req, res, next) => {
  try {
    const { courseId, attendanceId } = req.params;

    validateId(courseId, "course");
    validateId(attendanceId, "attendance");

    const attendance = await CourseAttendance.findOne({
      _id: attendanceId,
      course: courseId,
    }).populate("student");

    if (!attendance) {
      return res.status(404).json({
        status: "fail",
        message: "Attendance not found for this course",
      });
    }

    res.status(200).json({
      status: "success",
      data: attendance,
    });
  } catch (err) {
    if (err && err.name === "CastError") {
      return res.status(400).json({
        error: "CastError",
        message: err.message,
      });
    }

    next(err);
  }
};

// ---------------------------------------------
// Delete attendance
// DELETE /api/v1/courses/:courseId/attendances/:attendanceId
// ---------------------------------------------
exports.deleteAttendance = async (req, res, next) => {
  try {
    const { courseId, attendanceId } = req.params;

    validateId(courseId, "course");
    validateId(attendanceId, "attendance");

    if (!req.user || req.user.role !== "teacher") {
      return res.status(403).json({ status: "fail", message: "Forbidden" });
    }

    const deleted = await CourseAttendance.findOneAndDelete({
      _id: attendanceId,
      course: courseId,
    });

    if (!deleted) {
      return res.status(404).json({
        status: "fail",
        message: "Attendance not found for this course",
      });
    }

    return res.status(204).send();
  } catch (err) {
    if (err && err.name === "CastError") {
      return res.status(400).json({
        error: "CastError",
        message: err.message,
      });
    }

    next(err);
  }
};
