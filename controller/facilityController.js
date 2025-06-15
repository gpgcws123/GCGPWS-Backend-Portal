const Facility = require('../models/Facility');
const fs = require('fs');
const path = require('path');

// Create new facility
exports.create = async (req, res) => {
  try {
    console.log('Creating facility with file:', req.file); // Debug log

    const facilityData = {
      ...req.body,
      images: req.file ? ['/uploads/facilities/' + req.file.filename] : []
    };

    console.log('Facility data:', facilityData); // Debug log

    const facility = new Facility(facilityData);
    await facility.save();

    res.status(201).json({
      success: true,
      data: facility
    });
  } catch (error) {
    console.error('Error creating facility:', error); // Debug log
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

    console.log('Retrieved facilities:', facilities); // Debug log

    res.status(200).json({
      success: true,
      count: facilities.length,
      data: facilities
    });
  } catch (error) {
    console.error('Error getting facilities:', error); // Debug log
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
    console.log('Updating facility with file:', req.file); // Debug log

    const updateData = { ...req.body };

    if (req.file) {
      updateData.images = ['/uploads/facilities/' + req.file.filename];

      // Find old facility to delete old image
      const oldFacility = await Facility.findById(req.params.id);
      if (oldFacility && oldFacility.images && oldFacility.images.length > 0) {
        const oldImagePath = path.join(__dirname, '..', oldFacility.images[0]);
        console.log('Attempting to delete old image:', oldImagePath); // Debug log
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          console.log('Old image deleted successfully'); // Debug log
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

    console.log('Updated facility:', facility); // Debug log

    res.status(200).json({
      success: true,
      data: facility
    });
  } catch (error) {
    console.error('Error updating facility:', error); // Debug log
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
      console.log('Attempting to delete image:', imagePath); // Debug log
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log('Image deleted successfully'); // Debug log
      }
    }

    await facility.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting facility:', error); // Debug log
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};