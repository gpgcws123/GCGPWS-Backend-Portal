const express = require('express');
const router = express.Router();
const newsEventController = require('../controller/newsEventController');

// Multer setup for video upload
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads/cultural');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// CRUD routes (generic)
router.post('/', newsEventController.create);
router.get('/', newsEventController.getAll);
router.get('/:id', newsEventController.getOne);
router.put('/:id', newsEventController.update);
router.delete('/:id', newsEventController.delete);

// Explicit News routes
router.get('/news/list', (req, res) => {
  req.query.type = 'news';
  newsEventController.getAll(req, res);
});
router.get('/news/:id', newsEventController.getOne);
router.post('/news/create', (req, res) => {
  req.body.type = 'news';
  newsEventController.create(req, res);
});

// Explicit Events routes
router.get('/events/list', (req, res) => {
  req.query.type = 'event';
  newsEventController.getAll(req, res);
});
router.get('/events/:id', newsEventController.getOne);
router.post('/events/create', (req, res) => {
  req.body.type = 'event';
  newsEventController.create(req, res);
});

// Explicit Cultural routes
router.get('/cultural/list', (req, res) => {
  req.query.type = 'cultural';
  newsEventController.getAll(req, res);
});
router.get('/cultural/:id', newsEventController.getOne);
router.post('/cultural/create', upload.single('video'), (req, res) => {
  req.body.type = 'cultural';
  if (req.file) {
    req.body.video = '/uploads/cultural/' + req.file.filename;
  }
  newsEventController.create(req, res);
});

module.exports = router; 