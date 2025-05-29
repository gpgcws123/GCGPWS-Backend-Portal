const mongoose = require('mongoose');

// Sub-schema for items in sections like Stats, Top Stories, Notice Board, Why Choose Us
const itemSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  image: { type: String }, // Stores the path to the uploaded image
  buttonText: { type: String },
  buttonLink: { type: String },
  number: { type: String } // Used specifically for Stats
});

// Main Homepage schema
const homepageSchema = new mongoose.Schema({
  // Each section can have a title and description
  hero: {
    title: { type: String },
    images: [{ type: String }] // Array of paths to hero images
  },
  principal: {
    title: { type: String },
    description: { type: String },
    image: { type: String } // Path to the principal image
  },
  stats: {
    title: { type: String },
    description: { type: String },
    items: [itemSchema] // Array of stat items
  },
  topstories: {
    title: { type: String },
    description: { type: String },
    items: [itemSchema] // Array of top story items
  },
  whychooseus: {
    title: { type: String },
    description: { type: String },
    items: [itemSchema] // Array of why choose us items
  },
  noticeboard: {
    title: { type: String },
    description: { type: String },
    items: [itemSchema] // Array of notice items
  }
}, { timestamps: true });

const Homepage = mongoose.model('Homepage', homepageSchema);

module.exports = Homepage; 