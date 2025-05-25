const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');

// Admin login route
router.post('/admin/login', authController.login);

module.exports = router;