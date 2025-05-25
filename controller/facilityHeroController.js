const FacilityHero = require('../models/facilityHero');
const fs = require('fs');
const path = require('path');

exports.create = async (req, res) => {
    try {
        const heroData = {
            ...req.body,
            imageUrl: req.file ? '/uploads/facilities/' + req.file.filename : null
        };

        const facilityHero = new FacilityHero(heroData);
        await facilityHero.save();
        
        res.status(201).json({
            success: true,
            data: facilityHero
        });
    } catch (error) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

exports.getAll = async (req, res) => {
    try {
        const facilityHeroes = await FacilityHero.find();
        res.status(200).json({
            success: true,
            data: facilityHeroes
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

exports.getOne = async (req, res) => {
    try {
        const facilityHero = await FacilityHero.findById(req.params.id);
        if (!facilityHero) {
            return res.status(404).json({
                success: false,
                error: 'Facility hero not found'
            });
        }
        res.status(200).json({
            success: true,
            data: facilityHero
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

exports.update = async (req, res) => {
    try {
        const updateData = { ...req.body };
        
        if (req.file) {
            updateData.imageUrl = '/uploads/facilities/' + req.file.filename;
            
            // Find old hero to delete old image
            const oldHero = await FacilityHero.findById(req.params.id);
            if (oldHero && oldHero.imageUrl) {
                const oldImagePath = path.join(__dirname, '..', oldHero.imageUrl);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
        }

        const facilityHero = await FacilityHero.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!facilityHero) {
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({
                success: false,
                error: 'Facility hero not found'
            });
        }

        res.status(200).json({
            success: true,
            data: facilityHero
        });
    } catch (error) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

exports.delete = async (req, res) => {
    try {
        const facilityHero = await FacilityHero.findById(req.params.id);
        if (!facilityHero) {
            return res.status(404).json({
                success: false,
                error: 'Facility hero not found'
            });
        }

        // Delete associated image file
        if (facilityHero.imageUrl) {
            const imagePath = path.join(__dirname, '..', facilityHero.imageUrl);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await facilityHero.remove();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}; 