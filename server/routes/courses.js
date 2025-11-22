const express = require("express");
const ctrl = require("../controllers/coursesController");
const router = express.Router();

router.post("/", ctrl.createCourse);
router.get("/", ctrl.getCourses);
router.get("/:id", ctrl.getCourseById);
router.patch("/:id", ctrl.updateCourse);
router.put("/:id", ctrl.replaceCourse);
router.delete("/:id", ctrl.deleteCourse);
router.delete("/", ctrl.deleteAllCourses);

module.exports = router;
