const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    members: [{
        type: String
    }],
    isPrivate: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);