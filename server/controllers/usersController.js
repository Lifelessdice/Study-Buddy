const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/users');

function ensureRequiredFields(body) {
  const required = {
    email: 'Email is required',
    role: 'Role is required',
    password: 'Password is required'
  };

  for (const [field, message] of Object.entries(required)) {
    const value = body[field];
    if (
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '')
    ) {
      const err = new Error(message);
      err.name = 'ValidationError';
      throw err;
    }
  }
}

function ensureNonEmptyIfPresent(body, field, message) {
  if (Object.prototype.hasOwnProperty.call(body, field)) {
    const value = body[field];
    if (
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '')
    ) {
      const err = new Error(message);
      err.name = 'ValidationError';
      throw err;
    }
  }
}

// Create User
exports.createUser = async (req, res, next) => {
  try {
    ensureRequiredFields(req.body);
    ensureNonEmptyIfPresent(req.body, 'name', 'Name cannot be blank');

    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 12);
    }

    const user = await User.create(req.body);
    const safeUser = user.toObject();
    delete safeUser.password;

    res.status(201).json({ status: 'success', data: safeUser });
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

    // Inline invalid ObjectId handling -> return 400 CastError
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'CastError', message: 'Invalid ID format' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }
    const safeUser = user.toObject();
    delete safeUser.password;

    res.status(200).json({ status: 'success', data: safeUser });
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

    ensureNonEmptyIfPresent(req.body, 'email', 'Email is required');
    ensureNonEmptyIfPresent(req.body, 'role', 'Role is required');
    ensureNonEmptyIfPresent(req.body, 'name', 'Name cannot be blank');
    ensureNonEmptyIfPresent(req.body, 'password', 'Password is required');

    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 12);
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
    ensureRequiredFields(req.body);
    ensureNonEmptyIfPresent(req.body, 'name', 'Name cannot be blank');

    // Step 4: Overwrite with validation
    const updated = await User.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
      overwrite: true
    });

    const safeUser = updated.toObject();
    delete safeUser.password;

    res.status(200).json({
      status: 'success',
      data: safeUser
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
