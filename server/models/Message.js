const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    room: {
        type: String,
        required: true
    },
    sender: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true,
        maxlength: 1000
    },
    messageType: {
        type: String,
        enum: ['text', 'image', 'file'],
        default: 'text'
    },
    readBy: [{
        username: String,
        readAt: Date
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);