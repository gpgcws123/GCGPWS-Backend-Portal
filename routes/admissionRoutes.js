const express = require('express');
const router = express.Router();
const admissionController = require('../controller/admissionController'); // Corrected path
const notificationController = require('../controller/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.post('/submit', admissionController.submitAdmission);
router.get('/all', admissionController.getAllAdmissions); // New public route for viewing all applications
router.put('/:id/status', admissionController.updateAdmissionStatus);

// Protected routes (not used in simplified version)
// router.get('/', authMiddleware.verifyAdmin, admissionController.getAllAdmissions);
// router.get('/stats', authMiddleware.verifyAdmin, admissionController.getAdmissionStats);
// router.get('/:id', authMiddleware.verifyAdmin, admissionController.getAdmissionById);
// router.put('/:id/status', authMiddleware.verifyAdmin, admissionController.updateAdmissionStatus);

// Notification routes
router.get('/notifications', authMiddleware.verifyAdmin, notificationController.getNotifications);
router.get('/notifications/unread-count', authMiddleware.verifyAdmin, notificationController.getUnreadCount);
router.put('/notifications/:id/mark-read', authMiddleware.verifyAdmin, notificationController.markAsRead);
router.put('/notifications/mark-all-read', authMiddleware.verifyAdmin, notificationController.markAllAsRead);

// Get admission statistics
router.get('/stats', admissionController.getAdmissionStats);

// Get single admission
router.get('/:id', admissionController.getAdmissionById);

module.exports = router;