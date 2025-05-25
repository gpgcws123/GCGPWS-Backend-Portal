const NewsEvent = require('../models/NewsEvent');

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

    const newsEvents = await NewsEvent.find(query).sort({ date: -1 });
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

// Update news/event
exports.update = async (req, res) => {
  try {
    const newsEvent = await NewsEvent.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
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

// Delete news/event
exports.delete = async (req, res) => {
  try {
    const newsEvent = await NewsEvent.findByIdAndDelete(req.params.id);
    if (!newsEvent) {
      return res.status(404).json({
        success: false,
        error: 'News/Event not found'
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