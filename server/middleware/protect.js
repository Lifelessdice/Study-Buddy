/*
  Authentication middleware (JWT protection)

  This middleware protects private routes by:
  - extracting a JWT from the Authorization header
  - verifying its validity and expiration
  - loading the associated user from the database
  - attaching the authenticated user to req.user
*/

// JSON Web Token library used to sign and verify access tokens
const jwt = require('jsonwebtoken');

// User model used to validate that the token refers to a real user
const User = require('../models/users');

// Secret key used to verify JWT signatures.
// Falls back to a development value if not provided via environment variables.
const JWT_SECRET = process.env.JWT_SECRET || 'dev-test-secret';

// Express middleware that protects routes requiring authentication
module.exports = async function protect(req, res, next) {
  try {
    let token;

    // Check for Authorization header in the format: "Bearer <token>"
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // If no token is present, block access immediately
    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in'
      });
    }

    // Verify the token's signature and expiration
    // Decoded payload typically contains the user ID
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'User no longer exists'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid or expired token'
      });
    }
    next(err);
  }
};
