const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '..', 'uploads', 'student-portal');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create type-specific directories
    const typeDir = path.join(uploadDir, req.body.type || 'misc');
    if (!fs.existsSync(typeDir)) {
      fs.mkdirSync(typeDir, { recursive: true });
    }
    cb(null, typeDir);
  },
  filename: (req, file, cb) => {
    // Create a URL-friendly filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + ext;
    cb(null, filename);
  }
});

// File filter to accept images and documents based on field name
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'image') {
    // Accept only images for image field
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Please upload only images for thumbnails.'), false);
    }
  } else if (file.fieldname === 'file') {
    // Accept different file types based on resource type
    const type = req.body.type;
    if (type === 'book' && file.mimetype === 'application/pdf') {
      cb(null, true);
    } else if (type === 'note' && (
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/msword' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )) {
      cb(null, true);
    } else if (type === 'lecture' && file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type for the selected resource type.'), false);
    }
  } else {
    cb(new Error('Invalid field name.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

module.exports = upload; 