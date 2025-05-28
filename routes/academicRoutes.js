const express = require('express');
const router = express.Router();
const academicController = require('../controller/academicController');
const upload = require('../middleware/upload');

// CRUD routes with file upload middleware
router.post('/', upload.single('image'), academicController.create);
router.get('/', academicController.getAll);
router.get('/:id', academicController.getOne);
router.put('/:id', upload.single('image'), academicController.update);
router.delete('/:id', academicController.delete);

module.exports = router; 