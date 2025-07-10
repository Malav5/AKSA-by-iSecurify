const mongoose = require("mongoose");

const agentSchema = new mongoose.Schema({
  agentName: { type: String, required: true },
  userEmail: { type: String, required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // New field for user assignment
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Agent", agentSchema); 