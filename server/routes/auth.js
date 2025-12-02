const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// register a new user account
router.post('/register', authController.register);

// login existing user
router.post('/login', authController.login);

module.exports = router;
