const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  notes: String,
  status: String,
  priority: String,
  assignee: String,
  category: String,
  criticality: String, // ✅ NEW
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', TaskSchema);
