const mongoose = require('mongoose');

const courseAttendanceSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required']
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required']
    }
  },
  {
    timestamps: true
  }
);

// prevent duplicate (same student, same course) enrollments
courseAttendanceSchema.index({ course: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('CourseAttendance', courseAttendanceSchema);
