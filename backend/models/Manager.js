const mongoose = require('mongoose');

const managerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    ip: {
        type: String,
        required: true,
        trim: true
    },
    apiUrl: {
        type: String,
        required: true,
        trim: true
    },
    baseUrl: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Manager', managerSchema); 