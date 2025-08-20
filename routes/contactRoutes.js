const express = require('express');
const router = express.Router();
const contactController = require('../controller/contactController');
// Auth temporarily disabled for contact routes as requested

// Public routes
router.post('/submit', contactController.submitContactForm);
router.get('/public/messages', contactController.getPublicMessages);

// Admin routes - now public as requested
router.get('/messages', contactController.getAllMessages);
router.put('/messages/:id/read', contactController.markAsRead);
router.put('/messages/:id', contactController.updateMessage);
router.post('/messages/:id/reply', contactController.replyToMessage);
router.delete('/messages/:id', contactController.deleteMessage);
router.get('/messages/unread-count', contactController.getUnreadCount);

module.exports = router;
