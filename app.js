require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Import routes
const admissionRoutes = require('./routes/admissionRoutes');
// Add this with your other route imports
const authRoutes = require('./routes/authRoutes');
const academicRoutes = require('./routes/academicRoutes');
const facilityRoutes = require('./routes/facilityRoutes');
const facilityHeroRoutes = require('./routes/facilityHeroRoutes');
const newsEventRoutes = require('./routes/newsEventRoutes');
const newsHeroRoutes = require('./routes/newsHeroRoutes');
const studentPortalRoutes = require('./routes/studentPortalRoutes');
const studentPortalHeroRoutes = require('./routes/studentPortalHeroRoutes');
const academicHeroRoutes = require('./routes/academicHeroRoutes');
const admissionHeroRoutes = require('./routes/admissionHeroRoutes');

// Import homepage routes
const homepageRoutes = require('./routes/homepage.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Firebase Admin
try {
    const serviceAccount = require('./serviceAccountKey.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin initialized successfully');
} catch (error) {
    console.error('Error initializing Firebase Admin:', error.message);
}

// CORS configuration
const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173'];
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create necessary upload directories
const createUploadDirs = () => {
    const dirs = [
        path.join(__dirname, 'uploads'),
        path.join(__dirname, 'uploads/student-portal'),
        path.join(__dirname, 'uploads/student-portal/book'),
        path.join(__dirname, 'uploads/student-portal/note'),
        path.join(__dirname, 'uploads/student-portal/lecture')
    ];
    
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};

createUploadDirs();

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    tlsInsecure: true
})
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.log('MongoDB connection error:', err));

// Middleware to verify Firebase token
const authenticateJWT = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    try {
        // Verify the Firebase token
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

// Routes
app.use('/api/admissions', admissionRoutes); // This should correctly prefix routes

// Remove these duplicate routes:
// app.get('/api/admissions', authenticateJWT, admissionRoutes.getAllAdmissions);
// app.put('/api/admissions/:id/status', authenticateJWT, admissionRoutes.updateStatus);

// Root route
app.get('/', (req, res) => {
    res.send('GCGPWS Backend API is running');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;

// Add this with your other route definitions
app.use('/api/auth', authRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/facility', facilityRoutes);
app.use('/api/facility-hero', facilityHeroRoutes);
app.use('/api/news-events', newsEventRoutes);
app.use('/api/hero-section', newsHeroRoutes);
app.use('/api/student-portal', studentPortalRoutes);
app.use('/api/student-portal-hero', studentPortalHeroRoutes);
app.use('/api/academic-hero', academicHeroRoutes);
app.use('/api/admission-hero', admissionHeroRoutes);

// Use homepage routes
app.use('/api/homepage', homepageRoutes);

// TinyMCE API key middleware
app.use((req, res, next) => {
    res.header('X-TinyMCE-API-Key', 'kgpqgw1s9eih5wsa0zyh7vz5god2gdybhz7wlnq8ojbnzl57');
    next();
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);

    // Handle Multer errors
    if (err.name === 'MulterError') {
        return res.status(400).json({
            success: false,
            error: err.message
        });
    }

    // Handle validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: Object.values(err.errors).map(e => e.message).join(', ')
        });
    }

    // Handle CORS errors
    if (err.message.includes('CORS')) {
        return res.status(403).json({
            success: false,
            error: 'CORS error: ' + err.message
        });
    }

    // Handle other errors
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Something went wrong!'
    });
});

// Handle undefined routes
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});