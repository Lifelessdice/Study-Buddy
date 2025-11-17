const express = require('express');
const User = require('../models/users'); // NOTE: '../models/users' (plural)
const router = express.Router();

// ---------------------------------------------
//  POST /api/v1/users  (FR1.2: create user with validation)
// ---------------------------------------------
router.post('/', async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err); // handled by global error handler in app.js
  }
});

// ---------------------------------------------
//  GET /api/v1/users  (for sanity checks / debugging)
// ---------------------------------------------
router.get('/', async (req, res, next) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
