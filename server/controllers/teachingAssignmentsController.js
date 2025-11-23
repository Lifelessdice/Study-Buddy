const TeachingAssignment = require('../models/teachingAssignments');
const Course = require('../models/courses');
const User = require('../models/users');

// ---------------------------------------------
// Create a new teaching assignment
// POST /api/v1/courses/:courseId/teachingAssignments
// ---------------------------------------------
exports.createAssignment = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { teacher } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'Course not found',
      });
    }

    const user = await User.findById(teacher);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Teacher (user) not found',
      });
    }

    const assignment = await TeachingAssignment.create({
      course: courseId,
      teacher,
    });

    res.status(201).json({
      status: 'success',
      data: assignment,
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------
// List all teaching assignments for a course
// GET /api/v1/courses/:courseId/teachingAssignments
// ---------------------------------------------
exports.getAllAssignments = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'Course not found',
      });
    }

    const assignments = await TeachingAssignment.find({ course: courseId })
      .populate('teacher')
      .exec();

    res.status(200).json({
      status: 'success',
      results: assignments.length,
      data: assignments,
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------
// Get a single teaching assignment by ID
// GET /api/v1/courses/:courseId/teachingAssignments/:assignmentId
// ---------------------------------------------
exports.getAssignmentById = async (req, res, next) => {
  try {
    const { courseId, assignmentId } = req.params;

    const assignment = await TeachingAssignment.findOne({
      _id: assignmentId,
      course: courseId,
    }).populate('teacher');

    if (!assignment) {
      return res.status(404).json({
        status: 'fail',
        message: 'Teaching assignment not found for this course',
      });
    }

    res.status(200).json({
      status: 'success',
      data: assignment,
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------
// Delete a teaching assignment
// DELETE /api/v1/courses/:courseId/teachingAssignments/:assignmentId
// ---------------------------------------------
exports.deleteAssignment = async (req, res, next) => {
  try {
    const { courseId, assignmentId } = req.params;

    const deleted = await TeachingAssignment.findOneAndDelete({
      _id: assignmentId,
      course: courseId,
    });

    if (!deleted) {
      return res.status(404).json({
        status: 'fail',
        message: 'Teaching assignment not found for this course',
      });
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};
