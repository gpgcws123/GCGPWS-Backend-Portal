const mongoose = require('mongoose');

const studentPortalHeroSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  image: {
    type: String,
    required: [true, 'Image is required']
  },
  buttonText: {
    type: String,
    default: 'Read More'
  },
  buttonLink: {
    type: String,
    default: '/student-portal'
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
studentPortalHeroSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('StudentPortalHero', studentPortalHeroSchema); 