const StudentPortalHero = require('../models/StudentPortalHero');
const fs = require('fs').promises;
const path = require('path');

// Helper function to delete file
const deleteFile = async (filePath) => {
  try {
    if (filePath) {
      const fullPath = path.join(__dirname, '..', filePath);
      await fs.unlink(fullPath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

// Helper function to format file path
const formatFilePath = (file) => {
  const relativePath = file.path
    .split('uploads')
    .pop()
    .replace(/^[\/\\]+/, '')
    .replace(/\\/g, '/');
  
  return `uploads/${relativePath}`;
};

// Get hero section
exports.getHero = async (req, res) => {
  try {
    const hero = await StudentPortalHero.findOne();
    res.status(200).json({
      success: true,
      data: hero
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Create or update hero section
exports.updateHero = async (req, res) => {
  try {
    const { title, description, buttonText, buttonLink } = req.body;
    
    // Find existing hero section
    let hero = await StudentPortalHero.findOne();
    
    // Handle image upload
    let imageUpdate = {};
    if (req.file) {
      // Delete old image if it exists
      if (hero?.image) {
        await deleteFile(hero.image);
      }
      imageUpdate.image = formatFilePath(req.file);
    }

    const updateData = {
      title,
      description,
      buttonText,
      buttonLink,
      ...imageUpdate
    };

    if (hero) {
      // Update existing hero section
      hero = await StudentPortalHero.findByIdAndUpdate(
        hero._id,
        updateData,
        { new: true, runValidators: true }
      );
    } else {
      // Create new hero section
      hero = await StudentPortalHero.create(updateData);
    }

    res.status(200).json({
      success: true,
      data: hero
    });
  } catch (error) {
    console.error('Error in updateHero:', error);
    // Clean up uploaded file if there's an error
    if (req.file) {
      await deleteFile(req.file.path);
    }
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Delete hero section
exports.deleteHero = async (req, res) => {
  try {
    const hero = await StudentPortalHero.findOne();
    
    if (!hero) {
      return res.status(404).json({
        success: false,
        error: 'Hero section not found'
      });
    }

    // Delete the image file if it exists
    if (hero.image) {
      await deleteFile(hero.image);
    }

    // Delete the hero document
    await StudentPortalHero.findByIdAndDelete(hero._id);

    res.status(200).json({
      success: true,
      message: 'Hero section deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteHero:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}; 