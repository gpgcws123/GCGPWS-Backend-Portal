const AdmissionHero = require('../models/admissionHero');
const fs = require('fs');
const path = require('path');

// Get active hero section
exports.getActive = async (req, res) => {
    try {
        const heroData = await AdmissionHero.findOne({ status: 'active' });
        res.json({ success: true, data: heroData });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Update hero section
exports.update = async (req, res) => {
    try {
        if (req.fileValidationError) {
            return res.status(400).json({ success: false, error: req.fileValidationError });
        }

        const { title, description, buttonText, buttonLink } = req.body;
        
        // Find existing hero section or create new one
        let heroSection = await AdmissionHero.findOne({ status: 'active' });
        
        if (!heroSection) {
            if (!req.file) {
                return res.status(400).json({ success: false, error: 'Image is required for new hero section' });
            }
            
            heroSection = new AdmissionHero({
                title,
                description,
                buttonText: buttonText || "View Admissions",
                buttonLink: buttonLink || "/admission",
                imageUrl: '/uploads/admission-hero/' + req.file.filename
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
                heroSection.imageUrl = '/uploads/admission-hero/' + req.file.filename;
            }
            
            heroSection.title = title;
            heroSection.description = description;
            heroSection.buttonText = buttonText || heroSection.buttonText;
            heroSection.buttonLink = buttonLink || heroSection.buttonLink;
        }

        await heroSection.save();
        res.json({ success: true, data: heroSection });
    } catch (error) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ success: false, error: error.message });
    }
};

// Delete hero section
exports.delete = async (req, res) => {
    try {
        const heroSection = await AdmissionHero.findById(req.params.id);
        if (!heroSection) {
            return res.status(404).json({ success: false, error: 'Hero section not found' });
        }

        // Delete associated image
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
}; 