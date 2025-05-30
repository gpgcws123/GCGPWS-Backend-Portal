const express = require('express');
const router = express.Router();
const contactController = require('../controller/contactController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Public routes
router.post('/submit', contactController.submitContactForm);
router.get('/public/messages', contactController.getPublicMessages);

// Admin routes - protected
router.get('/messages', verifyToken, verifyAdmin, contactController.getAllMessages);
router.put('/messages/:id/read', verifyToken, verifyAdmin, contactController.markAsRead);
router.delete('/messages/:id', verifyToken, verifyAdmin, contactController.deleteMessage);
router.get('/messages/unread-count', verifyToken, verifyAdmin, contactController.getUnreadCount);

module.exports = router;
