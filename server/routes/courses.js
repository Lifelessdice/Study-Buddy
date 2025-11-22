// routes/courses.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/coursesController');

router.post('/', controller.createCourse);
router.get('/', controller.listCourses);
router.get('/:id', controller.getCourse);
router.put('/:id', controller.replaceCourse);
router.patch('/:id', controller.updateCourse);
router.delete('/:id', controller.deleteCourse);
router.delete('/', controller.deleteAllCourses);

module.exports = router;
