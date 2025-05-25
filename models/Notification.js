const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['admission', 'system', 'other']
    },
    message: {
        type: String,
        required: true
    },
    relatedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admission',
        default: null
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notification', NotificationSchema);