const mongoose = require('mongoose');

const academicHeroSchema = new mongoose.Schema({
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
        default: "Read More"
    },
    buttonLink: {
        type: String,
        default: "/academic"
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, { timestamps: true });

module.exports = mongoose.model('AcademicHero', academicHeroSchema); 