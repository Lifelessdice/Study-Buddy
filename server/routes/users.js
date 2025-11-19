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
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalDocuments = await User.countDocuments();
    const totalPages = Math.ceil(totalDocuments / limit);

    const users = await User.find().skip(skip).limit(limit);

    // Add HATEOAS links to each user
    const usersWithLinks = users.map(user => ({
      ...user.toObject(),
      links: {
        self: `/api/v1/users/${user._id}`,
        update: `/api/v1/users/${user._id}`,
        delete: `/api/v1/users/${user._id}`
      }
    }));

    res.status(200).json({
      status: "success",
      page,
      limit,
      totalPages,
      totalDocuments,
      links: {
        self: `/api/v1/users?page=${page}&limit=${limit}`,
        next: page < totalPages ? `/api/v1/users?page=${page + 1}&limit=${limit}` : null,
        prev: page > 1 ? `/api/v1/users?page=${page - 1}&limit=${limit}` : null,
        first: `/api/v1/users?page=1&limit=${limit}`,
        last: `/api/v1/users?page=${totalPages}&limit=${limit}`
      },
      data: usersWithLinks
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// ---------------------------------------------
//  GET /api/v1/users/:id
//  FR4.3: Fetch a single user by ID (Read - detail)
// ---------------------------------------------
router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        ...user.toObject(),
        _links: userLinks(user._id)
      }
    });

  } catch (err) {
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
// DELETE /api/v1/users/:id
// FR4.5: Delete user by ID (Delete - detail)
// ----------------------------------------------
router.delete('/:id', async (req, res, next) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    // 204 No Content
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});


//----------------------------------------------
// DELETE /api/v1/users
// Delete all users 
//----------------------------------------------
router.delete('/', async (req, res, next) => {
  try {
    await User.deleteMany({});
    return res.status(204).send();
  } catch (err) {
    next(err);
  } 
});

// ----------------------------------------------
// PUT /api/v1/users/:id  (Full replace)
// ----------------------------------------------
router.put('/:id', async (req, res, next) => {
  try {
    // 1) Load existing user
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    // 2) Overwrite the entire document with the PUT payload
    //    (Strip _id if you want to be strict)
    const { _id, ...rest } = req.body;
    user.overwrite(rest);

    // 3) Validate + save (runs FULL schema validation, including required fields)
    await user.save();

    res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (err) {
    next(err); // ValidationError goes to global handler → 400
  }
});


module.exports = router;
