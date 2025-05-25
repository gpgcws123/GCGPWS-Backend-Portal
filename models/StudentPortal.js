const mongoose = require('mongoose');

const studentPortalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['notes', 'lecture', 'book'],
    default: 'notes'
  },
  subject: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  content: {
    type: String
  },
  fileUrl: {
    type: String,
    required: true
  },
  semester: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('StudentPortal', studentPortalSchema); 