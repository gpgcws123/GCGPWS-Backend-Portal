const express = require('express');
const router = express.Router();
const { getSection, updateSection, deleteSection } = require('../controller/homePageController');
const upload = require('../middleware/upload');

// Get section data
router.get('/:section', getSection);

// Update section data
router.put('/:section', upload.fields([
  { name: 'image', maxCount: 1 }
]), updateSection);

// Delete section
router.delete('/:section', deleteSection);

module.exports = router; 