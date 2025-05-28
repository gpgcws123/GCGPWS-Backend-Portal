const mongoose = require('mongoose');

const admissionHeroSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    buttonText: {
        type: String,
        default: "View Admissions"
    },
    buttonLink: {
        type: String,
        default: "/admission"
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, { timestamps: true });

module.exports = mongoose.model('AdmissionHero', admissionHeroSchema); 