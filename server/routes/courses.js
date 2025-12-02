const express = require("express");
const ctrl = require("../controllers/coursesController");
const protect = require("../middleware/protect");
const router = express.Router();

router.post("/", protect, ctrl.createCourse);
router.get("/", ctrl.getCourses);
router.get("/:id", ctrl.getCourseById);
router.patch("/:id", protect, ctrl.updateCourse);
router.put("/:id", protect, ctrl.replaceCourse);
router.delete("/:id", protect, ctrl.deleteCourse);
router.delete("/", protect, ctrl.deleteAllCourses);

module.exports = router;
