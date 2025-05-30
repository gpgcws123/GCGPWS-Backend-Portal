const Homepage = require('../models/homepage.model');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'uploads');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    // Create section-specific subdirectory
    const section = req.params.section;
    const sectionPath = path.join(uploadPath, section);
    if (!fs.existsSync(sectionPath)) {
      fs.mkdirSync(sectionPath);
    }
    // Return relative path for storage
    cb(null, `uploads/${section}`);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename with section, field name, timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image file.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Helper function to handle single image upload
const uploadSingleImage = upload.single('image');

// Helper function to handle multiple image uploads (for hero section)
const uploadMultipleImages = upload.array('images[]', 5); // Allow up to 5 images

// Helper function to handle item image uploads
const uploadItemImages = upload.fields([
  { name: 'itemImage_0', maxCount: 1 },
  { name: 'itemImage_1', maxCount: 1 },
  { name: 'itemImage_2', maxCount: 1 },
  { name: 'itemImage_3', maxCount: 1 },
  { name: 'itemImage_4', maxCount: 1 }
]);

// Middleware to handle file uploads before processing the main request
const handleFileUpload = (req, res, next) => {
    const section = req.params.section;

    if (section === 'hero') {
        uploadMultipleImages(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                return res.status(500).json({ success: false, message: err.message });
            } else if (err) {
                return res.status(500).json({ success: false, message: err.message });
            }
            next();
        });
    } else if (['topstories', 'whychooseus', 'stats', 'noticeboard'].includes(section)) {
        uploadItemImages(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                return res.status(500).json({ success: false, message: err.message });
            } else if (err) {
                return res.status(500).json({ success: false, message: err.message });
            }
            next();
        });
    } else if (section === 'principal') {
        uploadSingleImage(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                return res.status(500).json({ success: false, message: err.message });
            } else if (err) {
                return res.status(500).json({ success: false, message: err.message });
            }
            next();
        });
    } else {
        next();
    }
};

// Get homepage section data
const getHomepageSection = async (req, res) => {
  const section = req.params.section;

  try {
    // Find the single homepage document (assuming there's only one document for all homepage data)
    let homepageData = await Homepage.findOne();

    // If no document exists, create a default one
    if (!homepageData) {
      homepageData = new Homepage({});
      await homepageData.save();
    }

    // Check if the requested section exists in the schema
    if (homepageData[section] === undefined) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }

    // Return the data for the specific section
    res.status(200).json({ success: true, data: homepageData[section] });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching homepage section', error: error.message });
  }
};

// Update homepage section
const updateHomepageSection = async (req, res) => {
    try {
        const section = req.params.section;
        const updates = req.body;
        let homepageData = await Homepage.findOne();

        if (!homepageData) {
            homepageData = new Homepage();
        }

        // Initialize section if it doesn't exist
        if (!homepageData[section]) {
            homepageData[section] = {
                title: '',
                description: '',
                items: []
            };
        }
        // Initialize items array if it doesn't exist
        if (!homepageData[section].items) {
            homepageData[section].items = [];
        }

        // Handle file uploads based on section
        if (section === 'hero' && req.files) {
            const newImagePaths = req.files.map(file => file.path);
            homepageData.hero.images = [...(homepageData.hero.images || []), ...newImagePaths];
        } else if (['topstories', 'whychooseus', 'stats', 'noticeboard'].includes(section)) {
            try {
                console.log('Raw updates:', updates);
                console.log('Raw items:', updates.items);
                
                if (!updates.items) {
                    return res.status(400).json({ success: false, message: 'No items data provided' });
                }
                
                let updatedItems;
                try {
                    updatedItems = JSON.parse(updates.items);
                } catch (parseError) {
                    console.error('JSON parse error:', parseError);
                    return res.status(400).json({ success: false, message: 'Invalid JSON format for items' });
                }
                
                if (Array.isArray(updatedItems)) {
                    // Process each item's image if it exists in the file uploads
                    updatedItems.forEach((item, index) => {
                        const imageField = `itemImage_${index}`;
                        if (req.files && req.files[imageField] && req.files[imageField][0]) {
                            item.image = req.files[imageField][0].path;
                        }
                    });
                    
                    // Update the section's items
                    homepageData[section].items = updatedItems;
                } else {
                    console.error('Items update is not an array:', updates.items);
                }
            } catch (e) {
                console.error('Failed to parse items JSON:', e);
                return res.status(400).json({ success: false, message: 'Invalid items data' });
            }
        } else if (req.file) {
            // For single file uploads in other sections
            switch (section) {
                case 'principal':
                    homepageData.principal.image = req.file.path;
                    break;
                case 'stats':
                    homepageData.stats.image = req.file.path;
                    break;
                case 'noticeboard':
                    homepageData.noticeboard.image = req.file.path;
                    break;
                default:
                    break;
            }
        }

        // Update section data
        switch (section) {
            case 'hero':
                // Handle hero section with multiple images
                try {
                    console.log('Updating hero section with files:', req.files);
                    
                    // Get existing images
                    const existingImages = updates.existingImages ? JSON.parse(updates.existingImages) : [];
                    console.log('Existing images:', existingImages);
                    
                    // Process new images
                    const newImages = req.files ? req.files.map(file => {
                        console.log('Processing file:', file);
                        return file.path.replace(/\\/g, '/').replace('uploads/', '');
                    }) : [];
                    console.log('New images:', newImages);
                    
                    // Combine and limit images
                    const allImages = [...existingImages, ...newImages];
                    console.log('All images:', allImages);
                    
                    homepageData.hero = {
                        ...homepageData.hero,
                        title: updates.title || homepageData.hero.title,
                        description: updates.description || homepageData.hero.description,
                        images: allImages
                    };
                    console.log('Updated hero data:', homepageData.hero);
                } catch (error) {
                    console.error('Error processing hero images:', error);
                    return res.status(500).json({ success: false, message: 'Error processing hero images' });
                }
                break;

            case 'principal':
                homepageData.principal = {
                    ...homepageData.principal,
                    title: updates.title || homepageData.principal.title,
                    subtitle: updates.subtitle || homepageData.principal.subtitle,
                    description: updates.description || homepageData.principal.description,
                    image: homepageData.principal.image || ''
                };
                break;

            case 'stats':
                try {
                    // Parse items if they are sent as a string
                    const items = typeof updates.items === 'string' ? JSON.parse(updates.items) : updates.items;
                    
                    if (Array.isArray(items)) {
                        // Create a new array to store updated items
                        const updatedItems = items.map((item, index) => ({
                            ...item,
                            // Keep existing image if no new one is uploaded
                            image: (req.files && req.files[`itemImage_${index}`] && req.files[`itemImage_${index}`][0])
                                ? req.files[`itemImage_${index}`][0].path
                                : (item.image || '')
                        }));
                        
                        // Update the section with new data
                        homepageData.stats = {
                            ...homepageData.stats,
                            title: updates.title || homepageData.stats.title,
                            subtitle: updates.subtitle || homepageData.stats.subtitle,
                            description: updates.description || homepageData.stats.description,
                            items: updatedItems
                        };
                    }
                } catch (e) {
                    console.error('Error processing items:', e);
                    return res.status(400).json({ success: false, message: 'Invalid items data' });
                }
                break;

            case 'topstories':
            case 'whychooseus':
            case 'noticeboard':
                try {
                    // Parse items if they are sent as a string
                    const items = typeof updates.items === 'string' ? JSON.parse(updates.items) : updates.items;
                    
                    if (Array.isArray(items)) {
                        // Create a new array to store updated items
                        const updatedItems = items.map((item, index) => ({
                            ...item,
                            // Keep existing image if no new one is uploaded
                            image: (req.files && req.files[`itemImage_${index}`] && req.files[`itemImage_${index}`][0])
                                ? req.files[`itemImage_${index}`][0].path
                                : (item.image || '')
                        }));
                        
                        // Update the section with new data
                        homepageData[section] = {
                            ...homepageData[section],
                            title: updates.title || homepageData[section].title,
                            subtitle: updates.subtitle || homepageData[section].subtitle,
                            description: updates.description || homepageData[section].description,
                            items: updatedItems
                        };
                    }
                } catch (e) {
                    console.error('Error processing items:', e);
                    return res.status(400).json({ success: false, message: 'Invalid items data' });
                }
                break;

            case 'noticeboard':
                homepageData.noticeboard = {
                    ...homepageData.noticeboard,
                    title: updates.title || homepageData.noticeboard.title,
                    subtitle: updates.subtitle || homepageData.noticeboard.subtitle,
                    description: updates.description || homepageData.noticeboard.description,
                    image: homepageData.noticeboard.image || ''
                };
                break;

            default:
                return res.status(400).json({ success: false, message: 'Invalid section' });
        }

        await homepageData.save();
        return res.status(200).json({ success: true, data: homepageData });

    } catch (error) {
        console.error('Error updating homepage section:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getHomepageSection, updateHomepageSection, handleFileUpload }; 