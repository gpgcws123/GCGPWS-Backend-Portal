require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');

// Import routes
const admissionRoutes = require('./routes/admissionRoutes');
// Add this with your other route imports
const authRoutes = require('./routes/authRoutes');
const academicRoutes = require('./routes/academicRoutes');
const facilityRoutes = require('./routes/facilityRoutes');
const facilityHeroRoutes = require('./routes/facilityHeroRoutes');
const newsEventRoutes = require('./routes/newsEventRoutes');
const studentPortalRoutes = require('./routes/studentPortalRoutes');

const app = express();
const PORT = process.env.PORT || 8000;

// Initialize Firebase Admin
try {
    const serviceAccount = require('./serviceAccountKey.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin initialized successfully');
} catch (error) {
    console.error('Error initializing Firebase Admin. Make sure serviceAccountKey.json exists:', error.message);
    // Continue without Firebase - authentication will not work
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // Remove the directConnection option
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
app.use('/api/student-portal', studentPortalRoutes);

// TinyMCE API key middleware
app.use((req, res, next) => {
  res.header('X-TinyMCE-API-Key', 'kgpqgw1s9eih5wsa0zyh7vz5god2gdybhz7wlnq8ojbnzl57');
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

// Handle undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});