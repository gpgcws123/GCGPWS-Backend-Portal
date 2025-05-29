const HomePage = require('../models/HomePage');
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

// Get section data
exports.getSection = async (req, res) => {
  try {
    const section = await HomePage.findOne({ section: req.params.section });
    if (!section) {
      return res.status(404).json({
        success: false,
        error: 'Section not found'
      });
    }
    res.status(200).json({
      success: true,
      data: section
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Update section data
exports.updateSection = async (req, res) => {
  try {
    const { title, description, buttonText, buttonLink, stats } = req.body;
    const updateData = {
      title,
      description,
      buttonText,
      buttonLink
    };

    if (stats) {
      updateData.stats = JSON.parse(stats);
    }

    // Get existing section
    const existingSection = await HomePage.findOne({ section: req.params.section });
    
    // Handle image upload
    if (req.files?.image?.[0]) {
      // Delete old image if it exists
      if (existingSection?.image) {
        await deleteFile('uploads/' + existingSection.image);
      }
      updateData.image = formatFilePath(req.files.image[0]);
    }

    let section;
    if (existingSection) {
      section = await HomePage.findOneAndUpdate(
        { section: req.params.section },
        updateData,
        { new: true, runValidators: true }
      );
    } else {
      section = await HomePage.create({
        section: req.params.section,
        ...updateData
      });
    }

    res.status(200).json({
      success: true,
      data: section
    });
  } catch (error) {
    console.error('Error in updateSection:', error);
    // Clean up uploaded files if there's an error
    if (req.files) {
      Object.values(req.files).forEach(fileArray => {
        fileArray.forEach(file => {
          deleteFile(file.path);
        });
      });
    }
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Delete section
exports.deleteSection = async (req, res) => {
  try {
    const section = await HomePage.findOne({ section: req.params.section });
    if (!section) {
      return res.status(404).json({
        success: false,
        error: 'Section not found'
      });
    }

    // Delete associated image
    if (section.image) {
      await deleteFile('uploads/' + section.image);
    }

    await section.deleteOne();

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