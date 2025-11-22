const User = require("../models/users");
const { userLinks } = require("../Utils/hateoas");

// CREATE
exports.createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ status: "success", data: user });
  } catch (err) {
    next(err);
  }
};

// LIST ALL (with pagination + HATEOAS)
exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalDocuments = await User.countDocuments();
    const totalPages = Math.ceil(totalDocuments / limit);

    const users = await User.find().skip(skip).limit(limit);

    const usersWithLinks = users.map((user) => ({
      ...user.toObject(),
      links: userLinks(user._id),
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
        last: `/api/v1/users?page=${totalPages}&limit=${limit}`,
      },
      data: usersWithLinks,
    });
  } catch (err) {
    next(err);
  }
};

// GET BY ID
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user)
      return res.status(404).json({ status: "fail", message: "User not found" });

    res.status(200).json({
      status: "success",
      data: {
        ...user.toObject(),
        _links: userLinks(user._id),
      },
    });
  } catch (err) {
    next(err);
  }
};

// UPDATE (PATCH)
exports.updateUser = async (req, res, next) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated)
      return res.status(404).json({ status: "fail", message: "User not found" });

    res.status(200).json({ status: "success", data: updated });
  } catch (err) {
    next(err);
  }
};

// FULL REPLACE (PUT)
exports.replaceUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user)
      return res.status(404).json({ status: "fail", message: "User not found" });

    const { _id, ...rest } = req.body;
    user.overwrite(rest);
    await user.save();

    res.status(200).json({ status: "success", data: user });
  } catch (err) {
    next(err);
  }
};

// DELETE ONE
exports.deleteUser = async (req, res, next) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);

    if (!deleted)
      return res.status(404).json({ status: "fail", message: "User not found" });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// DELETE ALL
exports.deleteAllUsers = async (req, res, next) => {
  try {
    await User.deleteMany({});
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
