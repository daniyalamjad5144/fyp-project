const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', authController.register);

// @route   POST api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', authController.login);

// @route   GET api/auth/check-user/:email
// @desc    Check if user exists in database
// @access  Public
router.get('/check-user/:email', authController.checkUser);
router.get('/check-user', authController.checkUser);

module.exports = router;
