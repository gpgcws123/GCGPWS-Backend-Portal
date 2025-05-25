const StudentPortal = require('../models/StudentPortal');

// Create new student portal item
exports.create = async (req, res) => {
  try {
    const studentPortalItem = new StudentPortal(req.body);
    await studentPortalItem.save();
    res.status(201).json({
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

// Get all student portal items
exports.getAll = async (req, res) => {
  try {
    const { type, status, department, semester } = req.query;
    const query = {};
    
    if (type) query.type = type;
    if (status) query.status = status;
    if (department) query.department = department;
    if (semester) query.semester = semester;

    const studentPortalItems = await StudentPortal.find(query).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: studentPortalItems.length,
      data: studentPortalItems
    });
  } catch (error) {
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
    const studentPortalItem = await StudentPortal.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
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

// Delete student portal item
exports.delete = async (req, res) => {
  try {
    const studentPortalItem = await StudentPortal.findByIdAndDelete(req.params.id);
    if (!studentPortalItem) {
      return res.status(404).json({
        success: false,
        error: 'Student portal item not found'
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