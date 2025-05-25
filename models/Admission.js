const mongoose = require('mongoose');

const AdmissionSchema = new mongoose.Schema({
    // Personal Information
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    dob: {
        type: Date,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    zipCode: {
        type: String,
        required: true,
    },

    // Course Information
    course: {
        type: String,
        required: true,
        enum: ['btech', 'bsc', 'mtech', 'mba', 'msc', 'mca', 'fsc', 'premedical', 'ics', 'icom'],
    },
    admissionYear: {
        type: Number,
        required: true,
    },

    // Academic Information
    matricSchool: String,
    matricBoard: String,
    matricPassingYear: Number,
    matricPercentage: Number,

    interCollege: String,
    interBoard: String,
    interPassingYear: Number,
    interPercentage: Number,

    // Document URLs (stored in Cloudinary or similar service)
    photoUrl: {
        type: String,
        required: true,
    },
    matricMarksheetUrl: String,
    interMarksheetUrl: String,
    idProofUrl: {
        type: String,
        required: true,
    },

    // Application Status
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },

    // Admin notes
    adminNotes: {
        type: String,
        default: '',
    },

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },

    // If approved/rejected, who did it
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },

    // When was it reviewed
    reviewedAt: {
        type: Date,
        default: null,
    },

    // Has the applicant been notified
    isNotified: {
        type: Boolean,
        default: false,
    }
});

module.exports = mongoose.model('Admission', AdmissionSchema);