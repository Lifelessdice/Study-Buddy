const express = require('express');
const router = express.Router();
const courseAttendancesController = require('../controllers/courseAttendancesController');

// POST /api/v1/courses/:courseId/attendances
router.post('/:courseId/attendances', courseAttendancesController.createAttendance);

// GET /api/v1/courses/:courseId/attendances
router.get('/:courseId/attendances', courseAttendancesController.getAllAttendances);

// GET /api/v1/courses/:courseId/attendances/:attendanceId
router.get('/:courseId/attendances/:attendanceId', courseAttendancesController.getAttendanceById);

// DELETE /api/v1/courses/:courseId/attendances/:attendanceId
router.delete('/:courseId/attendances/:attendanceId', courseAttendancesController.deleteAttendance);

module.exports = router;
