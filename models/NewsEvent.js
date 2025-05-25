const mongoose = require('mongoose');

const newsEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['news', 'event', 'cultural'],
    default: 'news'
  },
  description: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  image: {
    type: String
  },
  venue: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'upcoming', 'completed'],
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

module.exports = mongoose.model('NewsEvent', newsEventSchema); 