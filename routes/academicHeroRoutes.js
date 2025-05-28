const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const academicHeroController = require('../controller/academicHeroController');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = 'uploads/academic-hero';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'hero-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
            req.fileValidationError = 'Only image files are allowed!';
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// Create hero section
router.post('/', upload.single('image'), academicHeroController.update);

// Get hero section data
router.get('/', academicHeroController.getActive);

// Update hero section
router.put('/', upload.single('image'), academicHeroController.update);

// Delete hero section
router.delete('/:id', academicHeroController.delete);

module.exports = router; 