const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    accessibility: {
      type: String,
      enum: ['public', 'course', 'private'],
      default: 'course',
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Associated course is required'],
    },
  },
  {
    timestamps: true,
  }
);

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
