const Facility = require('../models/Facility');
const fs = require('fs');
const path = require('path');

// Create new facility
exports.create = async (req, res) => {
  try {
    const facilityData = {
      ...req.body,
      images: req.file ? ['/uploads/facilities/' + req.file.filename] : []
    };

    const facility = new Facility(facilityData);
    await facility.save();
    
    res.status(201).json({
      success: true,
      data: facility
    });
  } catch (error) {
    // Delete uploaded file if save fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get all facilities
exports.getAll = async (req, res) => {
  try {
    const { type, status } = req.query;
    const query = {};
    
    if (type) query.type = type;
    if (status) query.status = status;

    const facilities = await Facility.find(query).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: facilities.length,
      data: facilities
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get single facility
exports.getOne = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) {
      return res.status(404).json({
        success: false,
        error: 'Facility not found'
      });
    }
    res.status(200).json({
      success: true,
      data: facility
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Update facility
exports.update = async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    if (req.file) {
      updateData.images = ['/uploads/facilities/' + req.file.filename];
      
      // Find old facility to delete old image
      const oldFacility = await Facility.findById(req.params.id);
      if (oldFacility && oldFacility.images && oldFacility.images.length > 0) {
        const oldImagePath = path.join(__dirname, '..', oldFacility.images[0]);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    const facility = await Facility.findByIdAndUpdate(
      req.params.id,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!facility) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        success: false,
        error: 'Facility not found'
      });
    }

    res.status(200).json({
      success: true,
      data: facility
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

// Delete facility
exports.delete = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) {
      return res.status(404).json({
        success: false,
        error: 'Facility not found'
      });
    }

    // Delete associated image file
    if (facility.images && facility.images.length > 0) {
      const imagePath = path.join(__dirname, '..', facility.images[0]);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await facility.remove();

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