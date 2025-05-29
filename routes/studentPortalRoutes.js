const express = require('express');
const router = express.Router();
const studentPortalController = require('../controller/studentPortalController');
const upload = require('../middleware/upload');

// Setup multer fields for both image and file uploads
const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'file', maxCount: 1 }
]);

// CRUD routes with file upload middleware
router.post('/', uploadFields, studentPortalController.create);
router.get('/', studentPortalController.getAll);
router.get('/:id', studentPortalController.getOne);
router.put('/:id', uploadFields, studentPortalController.update);
router.delete('/:id', studentPortalController.delete);

module.exports = router; 