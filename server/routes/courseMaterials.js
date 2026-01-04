const express = require("express");
const courseMaterialsController = require("../controllers/courseMaterialsController");
const upload = require("../utils/upload");
const protect = require("../middleware/protect");

const router = express.Router();

router.post(
  "/:courseId/materials",
  protect,
  upload.single("file"),
  courseMaterialsController.createMaterial
);

router.get("/:courseId/materials", courseMaterialsController.getMaterials);

router.delete(
  "/:courseId/materials/:materialId",
  protect,
  courseMaterialsController.deleteMaterial
);

router.post(
  "/:courseId/materials/:materialId/summaries",
  courseMaterialsController.createMaterialSummary
);

router.post(
  "/:courseId/materials/:materialId/aiquizzes",
  courseMaterialsController.createMaterialQuiz
);

router.post(
  "/:courseId/materials/:materialId/flashcards",
  courseMaterialsController.createMaterialFlashcards
);

module.exports = router;
