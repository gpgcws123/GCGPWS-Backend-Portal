const express = require('express');
const router = express.Router();
const newsEventController = require('../controller/newsEventController');

// Multer setup for file uploads
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads/cultural');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Add file extension to maintain proper file type
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images and videos
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
  }
};

// Configure multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  }
}).fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]);

// Helper function to delete old files
const deleteOldFiles = async (id) => {
  try {
    const oldRecord = await newsEventController.findById(id);
    if (oldRecord) {
      if (oldRecord.image) {
        const oldImagePath = path.join(__dirname, '..', oldRecord.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      if (oldRecord.video) {
        const oldVideoPath = path.join(__dirname, '..', oldRecord.video);
        if (fs.existsSync(oldVideoPath)) {
          fs.unlinkSync(oldVideoPath);
        }
      }
    }
  } catch (error) {
    console.error('Error deleting old files:', error);
  }
};

// Wrapper for file upload error handling
const handleUpload = (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: 'File upload error',
        error: err.message
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type',
        error: err.message
      });
    }
    next();
  });
};

// CRUD routes (generic)
router.post('/', newsEventController.create);
router.get('/', newsEventController.getAll);
router.get('/:id', newsEventController.getOne);
router.put('/:id', handleUpload, async (req, res) => {
  try {
    const id = req.params.id;

    // Handle new files
    if (req.files) {
      // Delete old files before updating
      await deleteOldFiles(id);

      if (req.files.image) {
        req.body.image = '/uploads/cultural/' + req.files.image[0].filename;
      }
    }

    await newsEventController.update(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating item',
      error: error.message
    });
  }
});
router.delete('/:id', newsEventController.delete);

// Explicit News routes
router.get('/news/list', (req, res) => {
  req.query.type = 'news';
  newsEventController.getAll(req, res);
});
router.get('/news/:id', newsEventController.getOne);
router.post('/news/create', handleUpload, async (req, res) => {
  try {
    req.body.type = 'news';
    if (req.files && req.files.image) {
      req.body.image = '/uploads/cultural/' + req.files.image[0].filename;
    }
    await newsEventController.create(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating news',
      error: error.message
    });
  }
});

// Explicit Events routes
router.get('/events/list', (req, res) => {
  req.query.type = 'event';
  newsEventController.getAll(req, res);
});
router.get('/events/:id', newsEventController.getOne);
router.post('/events/create', handleUpload, async (req, res) => {
  try {
    req.body.type = 'event';
    if (req.files && req.files.image) {
      req.body.image = '/uploads/cultural/' + req.files.image[0].filename;
    }
    await newsEventController.create(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating event',
      error: error.message
    });
  }
});

// Explicit Cultural routes
router.get('/cultural/list', (req, res) => {
  req.query.type = 'cultural';
  newsEventController.getAll(req, res);
});
router.get('/cultural/:id', newsEventController.getOne);
router.post('/cultural/create', handleUpload, async (req, res) => {
  try {
    req.body.type = 'cultural';
    if (req.files) {
      if (req.files.video) {
        req.body.video = '/uploads/cultural/' + req.files.video[0].filename;
      }
      if (req.files.image) {
        req.body.image = '/uploads/cultural/' + req.files.image[0].filename;
      }
    }
    await newsEventController.create(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating cultural activity',
      error: error.message
    });
  }
});

router.delete('/cultural/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await deleteOldFiles(id);
    await newsEventController.delete(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting cultural activity',
      error: error.message
    });
  }
});

module.exports = router;