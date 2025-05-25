const Academic = require('../models/Academic');

// Create new academic item
exports.create = async (req, res) => {
  try {
    const academic = new Academic(req.body);
    await academic.save();
    res.status(201).json({
      success: true,
      data: academic
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get all academic items
exports.getAll = async (req, res) => {
  try {
    const { type, status } = req.query;
    const query = {};
    
    if (type) query.type = type;
    if (status) query.status = status;

    const academics = await Academic.find(query).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: academics.length,
      data: academics
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get single academic item
exports.getOne = async (req, res) => {
  try {
    const academic = await Academic.findById(req.params.id);
    if (!academic) {
      return res.status(404).json({
        success: false,
        error: 'Academic item not found'
      });
    }
    res.status(200).json({
      success: true,
      data: academic
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Update academic item
exports.update = async (req, res) => {
  try {
    const academic = await Academic.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!academic) {
      return res.status(404).json({
        success: false,
        error: 'Academic item not found'
      });
    }
    res.status(200).json({
      success: true,
      data: academic
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Delete academic item
exports.delete = async (req, res) => {
  try {
    const academic = await Academic.findByIdAndDelete(req.params.id);
    if (!academic) {
      return res.status(404).json({
        success: false,
        error: 'Academic item not found'
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