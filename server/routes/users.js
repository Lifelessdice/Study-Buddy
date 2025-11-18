const express = require('express');
const User = require('../models/users'); 
const router = express.Router();

// ---------------------------------------------
//  POST /api/v1/users  (Create user - FR4.2)
// ---------------------------------------------
router.post('/', async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    // You can later standardize this response too if you want
    res.status(201).json({
      status: 'success',
      data: user,
    });
  } catch (err) {
    next(err); // handled by global error handler in app.js
  }
});

// ---------------------------------------------
//  GET /api/v1/users
//  FR4.3: List all users (Read - collection)
// ---------------------------------------------
router.get('/', async (req, res, next) => {
  try {
    // later FR9 can plug filtering/sorting/pagination into this
    const users = await User.find();

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: users,
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------
//  GET /api/v1/users/:id
//  FR4.3: Fetch a single user by ID (Read - detail)
// ---------------------------------------------
router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    // Valid ObjectId but no document found
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    // Document found
    res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (err) {
    // Invalid ObjectId -> CastError -> handled by global error handler,
    // or any other error bubbles up there as well.
    next(err);
  }
});


// ----------------------------------------------
// PATCH /api/v1/users/:id
// FR4.4: Update user by ID (Update - detail)
// ----------------------------------------------
router.patch('/:id', async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // return the updated document
      runValidators: true, // run schema validators on update
    });
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (err) {
    next(err);
  }     
});

// ----------------------------------------------

module.exports = router;
