const mongoose = require('mongoose');

const teachingAssignmentSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required']
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Teacher is required']
    }
  },
  {
    timestamps: true
  }
);

// prevent duplicate teacher-course assignments
teachingAssignmentSchema.index({ course: 1, teacher: 1 }, { unique: true });

module.exports = mongoose.model('TeachingAssignment', teachingAssignmentSchema);
