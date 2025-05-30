const express = require('express');
const router = express.Router();
const homepageController = require('../controller/homepage.controller');
const multer = require('multer');
const path = require('path');

// Serve static files from uploads directory
router.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Configure multer storage for item images within the controller or here if needed separately
// const itemStorage = multer.diskStorage({ ... });
// const uploadItemImage = multer({ storage: itemStorage }).single('image');

// Route to get data for a specific homepage section
router.get('/:section', homepageController.getHomepageSection);

// Route to update data for a specific homepage section
// Use the file upload middleware before the controller function
router.post('/:section', homepageController.handleFileUpload, homepageController.updateHomepageSection);

// Note: Routes for adding/deleting individual items (stats, topstories, etc.) 
// might be needed if the frontend doesn't send the whole array on update.
// Example for adding a stat item: (You would need a controller function for this)
// router.post('/stats/items', homepageController.handleStatItemUpload, homepageController.addStatItem);
// Example for deleting a stat item: (You would need a controller function for this)
// router.delete('/stats/items/:itemId', homepageController.deleteStatItem);

module.exports = router; 