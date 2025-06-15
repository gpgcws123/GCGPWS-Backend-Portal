const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create base uploads directory if it doesn't exist
const baseUploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(baseUploadDir)) {
  fs.mkdirSync(baseUploadDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath;

    // Determine upload path based on the route
    if (req.baseUrl.includes('student-portal')) {
      uploadPath = path.join(baseUploadDir, 'student-portal', req.body.type || 'misc');
    } else if (req.baseUrl.includes('academic')) {
      uploadPath = path.join(baseUploadDir, 'academic');
    } else if (req.baseUrl.includes('facility')) {
      uploadPath = path.join(baseUploadDir, 'facilities');
    } else if (req.baseUrl.includes('admission')) {
      uploadPath = path.join(baseUploadDir, 'admissions');
    } else if (req.baseUrl.includes('news-events')) {
      if (req.baseUrl.includes('cultural')) {
        uploadPath = path.join(baseUploadDir, 'news-events', 'cultural');
      } else if (req.baseUrl.includes('news')) {
        uploadPath = path.join(baseUploadDir, 'news-events', 'news');
      } else if (req.baseUrl.includes('events')) {
        uploadPath = path.join(baseUploadDir, 'news-events', 'events');
      } else {
        uploadPath = path.join(baseUploadDir, 'news-events');
      }
    } else if (req.baseUrl.includes('hero-section')) {
      uploadPath = path.join(baseUploadDir, 'hero-section');
    } else {
      uploadPath = baseUploadDir;
    }

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    console.log('Upload path:', uploadPath); // Debug log
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Create a URL-friendly filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + ext;
    console.log('Generated filename:', filename); // Debug log
    cb(null, filename);
  }
});

// File filter to accept images and documents based on field name
const fileFilter = (req, file, cb) => {
  console.log('Processing file:', file.fieldname, file.mimetype); // Debug log

  if (file.fieldname === 'image') {
    // Accept only images for image field
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Please upload only images for thumbnails.'), false);
    }
  } else if (file.fieldname === 'file' && req.baseUrl.includes('student-portal')) {
    // Accept different file types based on resource type for student portal
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
  } else if (file.fieldname === 'video' && req.baseUrl.includes('news-events/cultural')) {
    // Accept video files for cultural activities
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Please upload only video files.'), false);
    }
  } else {
    cb(null, true); // Accept other files by default
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