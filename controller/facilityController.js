const Facility = require('../models/Facility');

// Create new facility
exports.create = async (req, res) => {
  try {
    const facility = new Facility(req.body);
    await facility.save();
    res.status(201).json({
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
    const facility = await Facility.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
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

// Delete facility
exports.delete = async (req, res) => {
  try {
    const facility = await Facility.findByIdAndDelete(req.params.id);
    if (!facility) {
      return res.status(404).json({
        success: false,
        error: 'Facility not found'
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