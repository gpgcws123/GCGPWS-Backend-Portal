const Homepage = require('../models/homepage.model');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'uploads');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadPath)){
        fs.mkdirSync(uploadPath);
    }
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Use original filename with a timestamp to avoid conflicts
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Helper function to handle single image upload
const uploadSingleImage = upload.single('image');

// Helper function to handle multiple image uploads (for hero section)
const uploadMultipleImages = upload.array('images', 5); // Allow up to 5 images

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
            // Files are uploaded, proceed to controller logic
            next();
        });
    } else if (['principal', 'stats', 'topstories', 'whychooseus', 'noticeboard'].includes(section)) {
        // For sections that might have individual item images or a single section image
        // We'll handle item images within the update logic
         uploadSingleImage(req, res, function (err) {
             if (err instanceof multer.MulterError) {
                 return res.status(500).json({ success: false, message: err.message });
             } else if (err) {
                 return res.status(500).json({ success: false, message: err.message });
             }
             next();
         });
    } else {
        // No file upload expected for this section
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

// Update homepage section data
const updateHomepageSection = async (req, res) => {
  const section = req.params.section;
  const updates = req.body;

  try {
    let homepageData = await Homepage.findOne();

    if (!homepageData) {
      return res.status(404).json({ success: false, message: 'Homepage data not found' });
    }

    // Check if the requested section exists in the schema
    if (homepageData[section] === undefined) {
      return res.status(404).json({ success: false, message: 'Section not found in data model' });
    }

    // Handle updates based on section type
    if (section === 'hero') {
      // Handle multiple image uploads for hero section
      if (req.files && req.files.length > 0) {
        // Add new image paths to the existing images array
        const newImagePaths = req.files.map(file => file.path);
        homepageData.hero.images = [...(homepageData.hero.images || []), ...newImagePaths];
      }
      // Update title if provided
      if (updates.title !== undefined) {
        homepageData.hero.title = updates.title;
      }
       // Note: Deleting images for hero section would need a separate route or logic

    } else if (['stats', 'topstories', 'whychooseus', 'noticeboard'].includes(section)) {
      // Handle sections with multiple items (including stats)

        // Update header fields if provided
        if (updates.title !== undefined) {
            homepageData[section].title = updates.title;
        }
        if (updates.description !== undefined) {
             homepageData[section].description = updates.description;
        }

       // Handle items array - this assumes the frontend sends the entire updated items array
       // Need to parse the JSON string sent from the frontend
        if (updates.items) {
            try {
                const updatedItems = JSON.parse(updates.items);
                 // Basic validation to ensure it's an array
                 if(Array.isArray(updatedItems)){
                      // You might need to handle image uploads for individual items here
                      // This would require a more complex update logic or separate item endpoints
                      // For now, we'll just save the item data assuming image paths are correctly handled by frontend or separate uploads
                     homepageData[section].items = updatedItems;
                 } else {
                      console.error('Items update is not an array:', updates.items);
                 }
            } catch (e) {
                console.error('Failed to parse items JSON:', e);
            }
        }

    } else if (section === 'principal') {
        // Handle single image upload for principal section
        if (req.file) {
            // Delete old image if it exists
            if (homepageData.principal.image) {
                const oldImagePath = path.join(__dirname, '..', homepageData.principal.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            homepageData.principal.image = req.file.path; // Save new image path
        }
        // Update title and description if provided
        if (updates.title !== undefined) {
            homepageData.principal.title = updates.title;
        }
        if (updates.description !== undefined) {
            homepageData.principal.description = updates.description;
        }
    } else {
        // Handle other sections with title/description only if any exist
        if (updates.title !== undefined) {
            homepageData[section].title = updates.title;
        }
        if (updates.description !== undefined) {
            homepageData[section].description = updates.description;
        }
         // Assuming other sections don't have images or items handled here
    }

    // Save the updated homepage document
    await homepageData.save();

    // Fetch and return the updated data for the specific section
    const updatedSectionData = homepageData[section];
    res.status(200).json({ success: true, data: updatedSectionData });

  } catch (error) {
    console.error('Error updating homepage section:', error);
    res.status(500).json({ success: false, message: 'Error updating homepage section', error: error.message });
  }
};


module.exports = { getHomepageSection, updateHomepageSection, handleFileUpload }; 