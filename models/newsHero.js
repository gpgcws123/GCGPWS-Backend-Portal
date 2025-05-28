const mongoose = require('mongoose');

const newsHeroSchema = new mongoose.Schema({
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
        default: "/news/allnews"
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, { timestamps: true });

module.exports = mongoose.model('NewsHero', newsHeroSchema); 