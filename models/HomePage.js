const mongoose = require('mongoose');

const HomePageSchema = new mongoose.Schema({
  section: {
    type: String,
    required: [true, 'Please specify the section'],
    enum: ['hero', 'principal', 'stats', 'topstories', 'whychooseus', 'noticeboard']
  },
  title: {
    type: String,
    required: [true, 'Please provide a title']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description']
  },
  image: {
    type: String
  },
  buttonText: {
    type: String
  },
  buttonLink: {
    type: String
  },
  stats: {
    downloads: String,
    users: String,
    files: String,
    places: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('HomePage', HomePageSchema); 