const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Question text is required'],
    },
    answers: {
      type: [String],
      validate: {
        validator: function (arr) {
          return Array.isArray(arr) && arr.length >= 2;
        },
        message: 'A question must have at least two answer options.',
      },
    },
    correctAnswerIndex: {
      type: Number,
      required: [true, 'Correct answer index is required'],
      min: 0,
    },
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Associated course is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // professor/admin user
    },
    questions: {
      type: [questionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;
