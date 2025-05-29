const StudentPortal = require('../models/StudentPortal');
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
const formatFilePath = (file, type) => {
  // Ensure the file path is relative to the uploads directory
  const relativePath = file.path
    .split('uploads')
    .pop()
    .replace(/^[\/\\]+/, '')
    .replace(/\\/g, '/');
  
  console.log('Original file path:', file.path);
  console.log('Formatted file path:', relativePath);
  
  return `uploads/${relativePath}`;
};

// Create new student portal item
exports.create = async (req, res) => {
  try {
    const { title, type, description, author, category, duration, subject, level } = req.body;
    console.log('Received files:', req.files); // Debug log
    
    // Handle file uploads
    const image = req.files?.image?.[0];
    const file = req.files?.file?.[0];

    if (!image || !file) {
      return res.status(400).json({
        success: false,
        error: 'Both image and file are required'
      });
    }

    const studentPortalItem = new StudentPortal({
      title,
      type,
      description,
      image: formatFilePath(image, type),
      file: formatFilePath(file, type),
      author,
      category,
      duration,
      subject,
      level
    });

    console.log('Saving item with data:', studentPortalItem);

    await studentPortalItem.save();
    res.status(201).json({
      success: true,
      data: studentPortalItem
    });
  } catch (error) {
    console.error('Error in create:', error);
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

// Get all student portal items
exports.getAll = async (req, res) => {
  try {
    const { type } = req.query;
    const query = type ? { type } : {};

    const studentPortalItems = await StudentPortal.find(query).sort({ createdAt: -1 });
    console.log('Found items:', studentPortalItems); // Debug log
    
    res.status(200).json({
      success: true,
      count: studentPortalItems.length,
      data: studentPortalItems
    });
  } catch (error) {
    console.error('Error in getAll:', error); // Debug log
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get single student portal item
exports.getOne = async (req, res) => {
  try {
    const studentPortalItem = await StudentPortal.findById(req.params.id);
    if (!studentPortalItem) {
      return res.status(404).json({
        success: false,
        error: 'Student portal item not found'
      });
    }
    res.status(200).json({
      success: true,
      data: studentPortalItem
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Update student portal item
exports.update = async (req, res) => {
  try {
    const { title, type, description, author, category, duration, subject, level } = req.body;
    const updateData = { 
      title, 
      type, 
      description,
      author,
      category,
      duration,
      subject,
      level
    };

    // Get existing item
    const existingItem = await StudentPortal.findById(req.params.id);
    if (!existingItem) {
      return res.status(404).json({
        success: false,
        error: 'Student portal item not found'
      });
    }

    console.log('Files in update request:', req.files);

    // Handle file uploads
    if (req.files?.image?.[0]) {
      // Delete old image if it exists
      if (existingItem.image) {
        await deleteFile('uploads/' + existingItem.image);
      }
      updateData.image = formatFilePath(req.files.image[0], type);
    }

    if (req.files?.file?.[0]) {
      // Delete old file if it exists
      if (existingItem.file) {
        await deleteFile('uploads/' + existingItem.file);
      }
      updateData.file = formatFilePath(req.files.file[0], type);
    } else if (!req.files?.file && existingItem.file) {
      // Keep existing file if no new file is uploaded
      updateData.file = existingItem.file;
    }

    console.log('Update data:', updateData);

    const studentPortalItem = await StudentPortal.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log('Updated item:', studentPortalItem);

    res.status(200).json({
      success: true,
      data: studentPortalItem
    });
  } catch (error) {
    console.error('Error in update:', error);
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

// Delete student portal item
exports.delete = async (req, res) => {
  try {
    const studentPortalItem = await StudentPortal.findById(req.params.id);
    if (!studentPortalItem) {
      return res.status(404).json({
        success: false,
        error: 'Student portal item not found'
      });
    }

    // Delete associated files
    await deleteFile('uploads/' + studentPortalItem.image);
    await deleteFile('uploads/' + studentPortalItem.file);

    // Delete the document
    await studentPortalItem.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error in delete:', error); // Debug log
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}; 