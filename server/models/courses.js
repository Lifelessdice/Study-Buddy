const mongoose = require("mongoose");

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
    material: {
      type: String,
      default: ""
    },
    degree: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
