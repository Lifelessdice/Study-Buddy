const mongoose = require("mongoose");
const { slugify, ensureUniqueSlug } = require("../Utils/slugify");

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Course name is required"],
    },
    code: {
      type: String,
      required: [true, "Course code is required"],
      trim: true
    },
    overview: {
      type: String,
      default: ""
    },
    degree: {
      type: String,
      default: ""
    },
    slug: {
      type: String,
      unique: true,
      index: true
    }
  },
  { timestamps: true }
);

courseSchema.pre("validate", async function (next) {
  try {
    if (!this.slug && this.name) {
      const base = slugify(this.name);
      await ensureUniqueSlug(this, base);
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Keep legacy "material" compatibility on responses
courseSchema.methods.toJSON = function () {
  const obj = this.toObject();
  if (obj.overview !== undefined) {
    obj.material = obj.overview;
  }
  return obj;
};

module.exports = mongoose.model("Course", courseSchema);
