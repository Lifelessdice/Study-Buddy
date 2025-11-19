const mongoose = require('mongoose');

const quizParticipationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: [true, 'Quiz is required'],
    },
    answers: {
      type: [Number],
      default: [],
    },
    score: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

quizParticipationSchema.index({ student: 1, quiz: 1 }, { unique: true });

const QuizParticipation = mongoose.model(
  'QuizParticipation',
  quizParticipationSchema
);

module.exports = QuizParticipation;
