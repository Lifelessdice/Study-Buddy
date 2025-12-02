const express = require('express');
const router = express.Router();
const teachingAssignmentsController = require('../controllers/teachingAssignmentsController');
const protect = require('../middleware/protect');

// POST /api/v1/courses/:courseId/teachingAssignments
router.post('/:courseId/teachingAssignments', protect, teachingAssignmentsController.createAssignment);

// GET /api/v1/courses/:courseId/teachingAssignments
router.get('/:courseId/teachingAssignments', teachingAssignmentsController.getAllAssignments);

// GET /api/v1/courses/:courseId/teachingAssignments/:assignmentId
router.get(
  '/:courseId/teachingAssignments/:assignmentId',
  teachingAssignmentsController.getAssignmentById
);

// DELETE /api/v1/courses/:courseId/teachingAssignments/:assignmentId
router.delete(
  '/:courseId/teachingAssignments/:assignmentId',
  protect,
  teachingAssignmentsController.deleteAssignment
);

module.exports = router;
