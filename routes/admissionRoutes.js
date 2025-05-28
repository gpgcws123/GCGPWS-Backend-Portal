const express = require('express');
const router = express.Router();
const admissionController = require('../controller/admissionController'); // Corrected path
const notificationController = require('../controller/notificationController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = 'uploads/admissions';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'admission-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
            req.fileValidationError = 'Only image files are allowed!';
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// Public routes
router.post('/submit', admissionController.submitAdmission);
router.get('/all', admissionController.getAllAdmissions); // New public route for viewing all applications
router.put('/:id/status', admissionController.updateAdmissionStatus);

// Content management routes
router.get('/', admissionController.getAdmissionContent);
router.post('/', upload.single('image'), admissionController.createAdmissionContent);
router.put('/:id', upload.single('image'), admissionController.updateAdmissionContent);
router.delete('/:id', admissionController.deleteAdmissionContent);

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