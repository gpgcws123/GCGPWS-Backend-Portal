const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
    // Application fields
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    dob: Date,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    course: String,
    admissionYear: String,
    matricSchool: String,
    matricBoard: String,
    matricPassingYear: String,
    matricPercentage: String,
    interCollege: String,
    interBoard: String,
    interPassingYear: String,
    interPercentage: String,
    photoUrl: String,
    matricMarksheetUrl: String,
    interMarksheetUrl: String,
    idProofUrl: String,
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    statusMessage: String,

    // Content management fields
    title: String,
    description: String,
    content: String,
    type: {
        type: String,
        enum: ['criteria', 'policy', 'admission']
    },
    image: String,
    startDate: Date,
    endDate: Date,
    seats: Number,
    duration: String
}, { timestamps: true });

module.exports = mongoose.model('Admission', admissionSchema);