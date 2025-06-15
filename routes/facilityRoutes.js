const express = require('express');
const router = express.Router();
const facilityController = require('../controller/facilityController');
const upload = require('../middleware/upload');

// Create uploads directory if it doesn't exist
const fs = require('fs');
const path = require('path');
const uploadsDir = path.join(__dirname, '../uploads/facilities');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from uploads directory
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// CRUD routes
router.post('/', upload.single('image'), facilityController.create);
router.get('/', facilityController.getAll);
router.get('/:id', facilityController.getOne);
router.put('/:id', upload.single('image'), facilityController.update);
router.delete('/:id', facilityController.delete);

module.exports = router;