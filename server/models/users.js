const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      unique: true,          // ensure no duplicate accounts
      lowercase: true
    },
    role: {
      type: String,
      enum: ['student', 'teacher'],
      required: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false          // So that it doesn't include password in normal queries
    }
  },
  { timestamps: true }
);

 // Hash the  password before saving the user


userSchema.pre('save', async function (next) {
  // Only hashes if password is new or modified
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});


//Compare a candidate password with the stored hash

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model('User', userSchema);
