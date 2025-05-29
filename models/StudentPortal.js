const mongoose = require('mongoose');

const studentPortalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required']
  },
  type: {
    type: String,
    required: [true, 'Type is required'],
    enum: ['book', 'note', 'lecture']
  },
  description: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    required: [true, 'Image is required']
  },
  file: {
    type: String,
    required: [true, 'File is required']
  },
  author: {
    type: String,
    default: ''
  },
  subject: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: ''
  },
  duration: {
    type: Number,
    default: 0
  },
  level: {
    type: String,
    enum: ['Intermediate', 'Graduate', 'Post Graduate', ''],
    default: ''
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

// Update the updatedAt field before saving
studentPortalSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('StudentPortal', studentPortalSchema); 