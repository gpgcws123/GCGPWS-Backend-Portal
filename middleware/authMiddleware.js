const admin = require('firebase-admin');

// Verify Firebase token
exports.verifyToken = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please log in.'
            });
        }

        try {
            // Verify Firebase token
            const decodedToken = await admin.auth().verifyIdToken(token);
            
            // Add user to request object
            req.user = decodedToken;
            next();
        } catch (error) {
            console.error('Token verification error:', error);
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token. Please log in again.'
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication error'
        });
    }
};

// Verify if user is admin
exports.verifyAdmin = [
    exports.verifyToken,
    async (req, res, next) => {
        try {
            // Get user document from Firestore
            const userDoc = await admin.firestore()
                .collection('students')
                .doc(req.user.uid)
                .get();

            if (!userDoc.exists) {
                return res.status(403).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const userData = userDoc.data();
            if (userData.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Admin privileges required.'
                });
            }

            next();
        } catch (error) {
            console.error('Admin verification error:', error);
            return res.status(500).json({
                success: false,
                message: 'Authorization error'
            });
        }
    }
];