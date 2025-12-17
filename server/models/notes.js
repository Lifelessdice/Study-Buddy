const mongoose = require("mongoose");
const { slugify, ensureUniqueSlug } = require("../Utils/slugify");

const noteSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: [true, "Topic is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    accessibility: {
      type: String,
      enum: ["public", "course", "private"],
      default: "course",
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Associated course is required"],
    },
    slug: {
      type: String,
      unique: true,
      index: true
    },
  },
  { timestamps: true }
);

noteSchema.pre("validate", async function (next) {
  try {
    if (!this.slug && this.topic) {
      const base = slugify(this.topic);
      await ensureUniqueSlug(this, base);
    }
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Note", noteSchema);
