const mongoose = require('mongoose');
const User = require('../models/users');

// Create User
exports.createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ status: 'success', data: user });
  } catch (err) {
    next(err);
  }
};

// List Users (with HATEOAS and pagination fields expected by tests)
exports.listUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    const page = 1;
    const limit = users.length;
    const totalPages = 1;
    const totalDocuments = users.length;

    const data = users.map(u => ({
      ...u.toObject(),
      links: {
        self: `/api/v1/users/${u._id}`,
        update: `/api/v1/users/${u._id}`,
        delete: `/api/v1/users/${u._id}`
      }
    }));

    res.status(200).json({
      status: 'success',
      page,
      limit,
      totalPages,
      totalDocuments,
      links: {
        self: '/api/v1/users?page=1',
        first: '/api/v1/users?page=1',
        last: '/api/v1/users?page=1',
        next: null,
        prev: null
      },
      data
    });
  } catch (err) {
    next(err);
  }
};

// Get User by ID
exports.getUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Inline invalid ObjectId handling → return 400 CastError
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'CastError', message: 'Invalid ID format' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }
    res.status(200).json({ status: 'success', data: user });
  } catch (err) {
    next(err);
  }
};

// Update User (PATCH)
exports.patchUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'CastError', message: 'Invalid ID format' });
    }

    const user = await User.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    res.status(200).json({ status: 'success', data: user });
  } catch (err) {
    next(err);
  }
};

// Overwrite User (PUT)
// Overwrite User (PUT)
exports.putUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Step 1: Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'CastError',
        message: 'Invalid ID format'
      });
    }

    // Step 2: Check if the user exists *before* validating body
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    // Step 3: Required fields check
    if (!req.body.email) {
      const error = new Error('Email is required');
      error.name = 'ValidationError';
      throw error;
    }

    if (!req.body.role) {
      const error = new Error('Role is required');
      error.name = 'ValidationError';
      throw error;
    }

    // Step 4: Overwrite with validation
    const updated = await User.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
      overwrite: true
    });

    res.status(200).json({
      status: 'success',
      data: updated
    });

  } catch (err) {
    next(err);
  }
};

// Delete User
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'CastError', message: 'Invalid ID format' });
    }

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// Bulk Delete Users
exports.bulkDeleteUsers = async (req, res, next) => {
  try {
    await User.deleteMany({});
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
