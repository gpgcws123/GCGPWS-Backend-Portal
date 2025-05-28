const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const NewsHero = require('../models/newsHero');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = 'uploads/news-hero';
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

// Get hero section data
router.get('/', async (req, res) => {
    try {
        const heroData = await NewsHero.findOne({ status: 'active' });
        res.json({ success: true, data: heroData });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update hero section
router.put('/', upload.single('image'), async (req, res) => {
    try {
        if (req.fileValidationError) {
            return res.status(400).json({ success: false, error: req.fileValidationError });
        }

        const { title, description, buttonText, buttonLink } = req.body;
        
        // Find existing hero section or create new one
        let heroSection = await NewsHero.findOne({ status: 'active' });
        
        if (!heroSection) {
            if (!req.file) {
                return res.status(400).json({ success: false, error: 'Image is required for new hero section' });
            }
            
            heroSection = new NewsHero({
                title,
                description,
                buttonText: buttonText || "Read More",
                buttonLink: buttonLink || "/news/allnews",
                imageUrl: '/uploads/news-hero/' + req.file.filename
            });
        } else {
            // If there's a new image, delete the old one
            if (req.file) {
                if (heroSection.imageUrl) {
                    const oldImagePath = path.join(__dirname, '..', heroSection.imageUrl);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
                heroSection.imageUrl = '/uploads/news-hero/' + req.file.filename;
            }
            
            heroSection.title = title;
            heroSection.description = description;
            heroSection.buttonText = buttonText || heroSection.buttonText;
            heroSection.buttonLink = buttonLink || heroSection.buttonLink;
        }

        await heroSection.save();
        res.json({ success: true, data: heroSection });
    } catch (error) {
        // If there was an error and we uploaded a file, delete it
        if (req.file) {
            const filePath = path.join(__dirname, '..', 'uploads/news-hero', req.file.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete hero section
router.delete('/:id', async (req, res) => {
    try {
        const heroSection = await NewsHero.findById(req.params.id);
        if (!heroSection) {
            return res.status(404).json({ success: false, error: 'Hero section not found' });
        }

        // Delete the associated image
        if (heroSection.imageUrl) {
            const imagePath = path.join(__dirname, '..', heroSection.imageUrl);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await heroSection.deleteOne();
        res.json({ success: true, message: 'Hero section deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router; 