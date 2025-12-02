const jwt = require('jsonwebtoken');
const User = require('../models/users');

// helper to sign JWT (fallback secret for CI/test environments)
const JWT_SECRET = process.env.JWT_SECRET || 'dev-test-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

function signToken(id) {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN, // token expiration time after which a user has to log in again
  });
}

// POST /api/v1/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, role, password } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email, password and role are required',
      });
    }

    const user = await User.create({ name, email, role, password });

    const token = signToken(user._id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (err) {
    // duplicate email etc. will end up here
    next(err);
  }
};

// POST /api/v1/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) check input
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password',
      });
    }

    // 2) find user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password',
      });
    }

    // 3) check password
    const isValid = await user.correctPassword(password, user.password);

    if (!isValid) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password',
      });
    }

    // 4) sign token
    const token = signToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};
