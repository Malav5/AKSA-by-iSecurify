const mongoose = require('mongoose');

const subadminManagerAssignmentSchema = new mongoose.Schema({
    subadminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Manager',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SubadminManagerAssignment', subadminManagerAssignmentSchema); 