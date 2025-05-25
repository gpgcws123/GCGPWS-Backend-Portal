const FacilityHero = require('../models/facilityHero');

exports.create = async (req, res) => {
    try {
        const facilityHero = new FacilityHero(req.body);
        await facilityHero.save();
        res.status(201).json({
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
        const facilityHero = await FacilityHero.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
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

exports.delete = async (req, res) => {
    try {
        const facilityHero = await FacilityHero.findByIdAndDelete(req.params.id);
        if (!facilityHero) {
            return res.status(404).json({
                success: false,
                error: 'Facility hero not found'
            });
        }
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