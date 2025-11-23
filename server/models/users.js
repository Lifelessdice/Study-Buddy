const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String,
       trim: true 
      },
    email: { type: String,
       required: [true, 'Email is required'], 
       trim: true },
    role: { type: String,
       enum: ['student', 'teacher'],
        required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
