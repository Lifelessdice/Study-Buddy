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
    overview: {
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

// Keep legacy "material" compatibility on responses
courseSchema.methods.toJSON = function () {
  const obj = this.toObject();
  if (obj.overview !== undefined) {
    obj.material = obj.overview;
  }
  return obj;
};

module.exports = mongoose.model("Course", courseSchema);
