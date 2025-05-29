const Academic = require('../models/Academic');
const fs = require('fs');
const path = require('path');

// Helper function to handle file deletion
const deleteFile = (filePath) => {
  if (filePath) {
    const fullPath = path.join(__dirname, '..', filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
};

// Create new academic item
exports.create = async (req, res) => {
  try {
    const academicData = { ...req.body };
    
    // Handle file upload
    if (req.file) {
      // Store relative path from uploads directory
      academicData.image = `/uploads/academic/${path.basename(req.file.path)}`;
    }

    const academic = new Academic(academicData);
    await academic.save();
    
    res.status(201).json({
      success: true,
      data: academic
    });
  } catch (error) {
    if (req.file) {
      deleteFile(req.file.path);
    }
    console.error('Error creating academic item:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get all academic items
exports.getAll = async (req, res) => {
  try {
    const { type } = req.query;
    const query = type ? { type } : {};
    const academics = await Academic.find(query);
    res.status(200).json({
      success: true,
      data: academics
    });
  } catch (error) {
    console.error('Error fetching academic items:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get single academic item
exports.getOne = async (req, res) => {
  try {
    let academic;
    const { id } = req.params;

    // Check if the id parameter matches any of the valid types
    if (['department', 'program', 'faculty'].includes(id)) {
      // If it's a type, get all items of that type
      academic = await Academic.find({ type: id });
      return res.status(200).json({
        success: true,
        data: academic
      });
    }

    // Otherwise, try to find by ID
    academic = await Academic.findById(id);
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
    console.error('Error fetching academic item:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Update academic item
exports.update = async (req, res) => {
  try {
    const academicData = { ...req.body };
    
    // Get existing academic item
    const existingAcademic = await Academic.findById(req.params.id);
    if (!existingAcademic) {
      if (req.file) {
        deleteFile(req.file.path);
      }
      return res.status(404).json({
        success: false,
        error: 'Academic item not found'
      });
    }

    // Handle file upload
    if (req.file) {
      // Delete old image if exists
      if (existingAcademic.image) {
        deleteFile(existingAcademic.image);
      }
      // Store relative path from uploads directory
      academicData.image = `/uploads/academic/${path.basename(req.file.path)}`;
    }

    const academic = await Academic.findByIdAndUpdate(
      req.params.id,
      academicData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: academic
    });
  } catch (error) {
    if (req.file) {
      deleteFile(req.file.path);
    }
    console.error('Error updating academic item:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Delete academic item
exports.delete = async (req, res) => {
  try {
    const academic = await Academic.findById(req.params.id);
    if (!academic) {
      return res.status(404).json({
        success: false,
        error: 'Academic item not found'
      });
    }

    // Delete associated image if exists
    if (academic.image) {
      deleteFile(academic.image);
    }

    await academic.deleteOne();

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