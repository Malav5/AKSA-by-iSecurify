const mongoose = require('mongoose');

const userSubadminAssignmentSchema = new mongoose.Schema({
    subadminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('UserSubadminAssignment', userSubadminAssignmentSchema); 