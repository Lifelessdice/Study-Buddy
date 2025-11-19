// routes/courseAttendances.js
const express = require('express');
const CourseAttendance = require('../models/courseAttendances');
const Course = require('../models/courses');
const User = require('../models/users');

const router = express.Router();

/**
 * POST /api/v1/courses/:courseId/attendances
 */
router.post('/:courseId/attendances', async (req, res, next) => {
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
});

/**
 * GET /api/v1/courses/:courseId/attendances
 */
router.get('/:courseId/attendances', async (req, res, next) => {
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
});

/**
 * GET /api/v1/courses/:courseId/attendances/:attendanceId
 */
router.get('/:courseId/attendances/:attendanceId', async (req, res, next) => {
  try {
    const { courseId, attendanceId } = req.params;

    const attendance = await CourseAttendance.findOne({
      _id: attendanceId,
      course: courseId
    })
      .populate('student');

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
});

/**
 * DELETE /api/v1/courses/:courseId/attendances/:attendanceId
 */
router.delete('/:courseId/attendances/:attendanceId', async (req, res, next) => {
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
});

module.exports = router;
