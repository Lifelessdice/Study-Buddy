const CourseAttendance = require('../models/courseAttendances');
const Course = require('../models/courses');
const User = require('../models/users');

// ---------------------------------------------
// Create a new attendance record
// POST /api/v1/courses/:courseId/attendances
// ---------------------------------------------
exports.createAttendance = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { student } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'Course not found'
      });
    }

    const user = await User.findById(student);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Student (user) not found'
      });
    }

    const attendance = await CourseAttendance.create({
      course: courseId,
      student
    });

    res.status(201).json({
      status: 'success',
      data: attendance
    });

  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------
// List all attendance records for a course
// GET /api/v1/courses/:courseId/attendances
// ---------------------------------------------
exports.getAllAttendances = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'Course not found'
      });
    }

    const attendances = await CourseAttendance.find({ course: courseId })
      .populate('student')
      .exec();

    res.status(200).json({
      status: 'success',
      results: attendances.length,
      data: attendances
    });

  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------
// Get a single attendance record
// GET /api/v1/courses/:courseId/attendances/:attendanceId
// ---------------------------------------------
exports.getAttendanceById = async (req, res, next) => {
  try {
    const { courseId, attendanceId } = req.params;

    const attendance = await CourseAttendance.findOne({
      _id: attendanceId,
      course: courseId
    }).populate('student');

    if (!attendance) {
      return res.status(404).json({
        status: 'fail',
        message: 'Attendance not found for this course'
      });
    }

    res.status(200).json({
      status: 'success',
      data: attendance
    });

  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------
// Delete an attendance record
// DELETE /api/v1/courses/:courseId/attendances/:attendanceId
// ---------------------------------------------
exports.deleteAttendance = async (req, res, next) => {
  try {
    const { courseId, attendanceId } = req.params;

    const deleted = await CourseAttendance.findOneAndDelete({
      _id: attendanceId,
      course: courseId
    });

    if (!deleted) {
      return res.status(404).json({
        status: 'fail',
        message: 'Attendance not found for this course'
      });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });

  } catch (err) {
    next(err);
  }
};
