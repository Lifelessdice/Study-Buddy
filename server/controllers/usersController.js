const User = require('../models/users');
const { userLinks } = require('../Utils/hateoas');

// ---------------------------------------------
// Create a new user
// ---------------------------------------------
exports.createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({
      status: 'success',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------
// List all users with pagination
// ---------------------------------------------
exports.getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalDocuments = await User.countDocuments();
    const totalPages = Math.ceil(totalDocuments / limit);

    const users = await User.find().skip(skip).limit(limit);

    const usersWithLinks = users.map(user => ({
      ...user.toObject(),
      links: {
        self: `/api/v1/users/${user._id}`,
        update: `/api/v1/users/${user._id}`,
        delete: `/api/v1/users/${user._id}`
      }
    }));

    res.status(200).json({
      status: 'success',
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
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------
// Get a single user by ID
// ---------------------------------------------
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        ...user.toObject(),
        _links: userLinks(user._id)
      }
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------
// Update a user by ID (partial update)
// ---------------------------------------------
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
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
};

// ---------------------------------------------
// Delete a user by ID
// ---------------------------------------------
exports.deleteUser = async (req, res, next) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------
// Delete all users
// ---------------------------------------------
exports.deleteAllUsers = async (req, res, next) => {
  try {
    await User.deleteMany({});
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------
// Full replace (PUT) user by ID
// ---------------------------------------------
exports.replaceUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    const { _id, ...rest } = req.body;
    user.overwrite(rest);

    await user.save();

    res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};
