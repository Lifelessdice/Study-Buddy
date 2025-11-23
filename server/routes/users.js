const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

// POST /api/v1/users
router.post('/', usersController.createUser);

// GET /api/v1/users
router.get('/', usersController.getAllUsers);

// GET /api/v1/users/:id
router.get('/:id', usersController.getUserById);

// PATCH /api/v1/users/:id
router.patch('/:id', usersController.updateUser);

// DELETE /api/v1/users/:id
router.delete('/:id', usersController.deleteUser);

// DELETE /api/v1/users
router.delete('/', usersController.deleteAllUsers);

// PUT /api/v1/users/:id
router.put('/:id', usersController.replaceUser);

module.exports = router;
