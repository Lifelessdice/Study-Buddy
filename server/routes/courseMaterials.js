const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const Course = require("../models/courses");
const CourseMaterial = require("../models/courseMaterials");
const upload = require("../utils/upload");
const protect = require("../middleware/protect");
const { summarizeText, generateQuiz, generateFlashcards } = require("../config/openAIconfig");

const router = express.Router();

async function findCourseOr404(courseId, res) {
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    res.status(400).json({
      status: "fail",
      error: "CastError",
      message: "Invalid course id"
    });
    return null;
  }

  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404).json({
      status: "fail",
      message: "Course not found"
    });
    return null;
  }

  return course;
}

async function findMaterialOr404(course, materialId, res) {
  if (!mongoose.Types.ObjectId.isValid(materialId)) {
    res.status(400).json({
      status: "fail",
      error: "CastError",
      message: "Invalid material id"
    });
    return null;
  }

  const material = await CourseMaterial.findOne({
    _id: materialId,
    course: course._id
  });

  if (!material) {
    res.status(404).json({
      status: "fail",
      message: "Material not found for this course"
    });
    return null;
  }

  return material;
}

async function extractPdfText(material) {
  const relPath = material.filePath.replace(/^\//, "");
  const fileOnDisk = path.join(__dirname, "..", relPath);
  const buffer = await fs.promises.readFile(fileOnDisk);
  const parsed = await pdfParse(buffer);
  return (parsed.text || "").trim();
}

// POST /api/v1/courses/:courseId/materials
router.post("/:courseId/materials", protect, upload.single("file"), async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const course = await findCourseOr404(courseId, res);
    if (!course) return;

    if (!req.file) {
      return res.status(400).json({
        status: "fail",
        message: "PDF file is required"
      });
    }

    const { title, description } = req.body || {};
    const material = await CourseMaterial.create({
      course: course._id,
      uploadedBy: req.user ? req.user._id : null,
      title: title && title.trim() ? title.trim() : path.basename(req.file.originalname, path.extname(req.file.originalname)),
      description,
      filePath: `/uploads/materials/${req.file.filename}`,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size
    });

    return res.status(201).json({
      status: "success",
      data: material
    });
  } catch (err) {
    if (err && err.message === "Only PDF files are allowed") {
      return res.status(400).json({
        status: "fail",
        message: err.message
      });
    }
    next(err);
  }
});

// GET /api/v1/courses/:courseId/materials
router.get("/:courseId/materials", async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const course = await findCourseOr404(courseId, res);
    if (!course) return;

    const materials = await CourseMaterial.find({ course: course._id })
      .populate("uploadedBy", "firstName lastName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: "success",
      results: materials.length,
      data: materials
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/courses/:courseId/materials/:materialId
router.delete("/:courseId/materials/:materialId", protect, async (req, res, next) => {
  try {
    const { courseId, materialId } = req.params;
    const course = await findCourseOr404(courseId, res);
    if (!course) return;

    const material = await CourseMaterial.findOneAndDelete({
      _id: materialId,
      course: course._id
    });

    if (!material) {
      return res.status(404).json({
        status: "fail",
        message: "Material not found for this course"
      });
    }

    // best-effort delete file
    if (material.filePath) {
      const relPath = material.filePath.replace(/^\//, "");
      const fileOnDisk = path.join(__dirname, "..", relPath);
      fs.unlink(fileOnDisk, () => {});
    }

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// AI summary for PDF material
router.post("/:courseId/materials/:materialId/summaries", async (req, res, next) => {
  try {
    const { courseId, materialId } = req.params;
    const course = await findCourseOr404(courseId, res);
    if (!course) return;
    const material = await findMaterialOr404(course, materialId, res);
    if (!material) return;

    const text = await extractPdfText(material);
    if (!text) {
      return res.status(400).json({
        status: "fail",
        message: "PDF has no extractable text"
      });
    }

    const summary = await summarizeText(text);
    return res.status(200).json({
      status: "success",
      data: { materialId: material._id, courseId: course._id, summary },
      summary
    });
  } catch (err) {
    next(err);
  }
});

// AI quiz for PDF material
router.post("/:courseId/materials/:materialId/aiquizzes", async (req, res, next) => {
  try {
    const { courseId, materialId } = req.params;
    const course = await findCourseOr404(courseId, res);
    if (!course) return;
    const material = await findMaterialOr404(course, materialId, res);
    if (!material) return;

    const text = await extractPdfText(material);
    if (!text) {
      return res.status(400).json({
        status: "fail",
        message: "PDF has no extractable text"
      });
    }

    const quiz = await generateQuiz(text);
    return res.status(200).json({
      status: "success",
      data: { materialId: material._id, courseId: course._id, quiz },
      quiz
    });
  } catch (err) {
    next(err);
  }
});

// AI flashcards for PDF material
router.post("/:courseId/materials/:materialId/flashcards", async (req, res, next) => {
  try {
    const { courseId, materialId } = req.params;
    const course = await findCourseOr404(courseId, res);
    if (!course) return;
    const material = await findMaterialOr404(course, materialId, res);
    if (!material) return;

    const text = await extractPdfText(material);
    if (!text) {
      return res.status(400).json({
        status: "fail",
        message: "PDF has no extractable text"
      });
    }

    const flashcards = await generateFlashcards(text);
    return res.status(200).json({
      status: "success",
      data: { materialId: material._id, courseId: course._id, flashcards },
      flashcards
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
