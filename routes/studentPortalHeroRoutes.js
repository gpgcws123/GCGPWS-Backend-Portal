const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getHero, updateHero, deleteHero } = require('../controller/studentPortalHeroController');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/student-portal/hero'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'hero-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Routes
router.get('/', getHero);
router.put('/', upload.single('image'), updateHero);
router.delete('/', deleteHero);

module.exports = router; 