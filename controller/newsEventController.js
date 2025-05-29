const NewsEvent = require('../models/NewsEvent');
const fs = require('fs');
const path = require('path');

// Helper function to delete file
const deleteFile = (filePath) => {
  if (!filePath) return;
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

// Create new news/event
exports.create = async (req, res) => {
  try {
    const newsEvent = new NewsEvent(req.body);
    await newsEvent.save();
    res.status(201).json({
      success: true,
      data: newsEvent
    });
  } catch (error) {
    // Delete uploaded files if save fails
    if (req.body.image) deleteFile(req.body.image);
    if (req.body.video) deleteFile(req.body.video);

    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get all news/events
exports.getAll = async (req, res) => {
  try {
    const { type, status, startDate, endDate } = req.query;
    const query = {};

    if (type) query.type = type;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const newsEvents = await NewsEvent.find(query).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: newsEvents.length,
      data: newsEvents
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get single news/event
exports.getOne = async (req, res) => {
  try {
    const newsEvent = await NewsEvent.findById(req.params.id);
    if (!newsEvent) {
      return res.status(404).json({
        success: false,
        error: 'News/Event not found'
      });
    }
    res.status(200).json({
      success: true,
      data: newsEvent
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Find by ID (helper method)
exports.findById = async (id) => {
  return await NewsEvent.findById(id);
};

// Update news/event
exports.update = async (req, res) => {
  try {
    // Find the existing record first
    const existingRecord = await NewsEvent.findById(req.params.id);
    if (!existingRecord) {
      // Delete uploaded files if update fails
      if (req.body.image) deleteFile(req.body.image);
      return res.status(404).json({
        success: false,
        error: 'News/Event not found'
      });
    }

    // Prepare update data
    const updateData = {
      ...req.body,
      updatedAt: Date.now()
    };

    // If no new image is provided, keep the existing one
    if (!req.body.image && existingRecord.image) {
      updateData.image = existingRecord.image;
    }

    // Update the record
    const newsEvent = await NewsEvent.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: newsEvent
    });
  } catch (error) {
    // Delete uploaded files if update fails
    if (req.body.image) deleteFile(req.body.image);

    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Delete news/event
exports.delete = async (req, res) => {
  try {
    const newsEvent = await NewsEvent.findById(req.params.id);

    if (!newsEvent) {
      return res.status(404).json({
        success: false,
        error: 'News/Event not found'
      });
    }

    // Delete associated files
    if (newsEvent.image) deleteFile(newsEvent.image);
    if (newsEvent.video) deleteFile(newsEvent.video);

    await newsEvent.deleteOne();

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