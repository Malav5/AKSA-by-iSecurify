const mongoose = require("mongoose");

const agentSchema = new mongoose.Schema({
  agentName: { type: String, required: true },
  agentId: { type: Number, required: true },
  agentIp: { type: String, required: true },
  deviceType: { type: String },
  status: { type: String },
  hostname: { type: String },
  os: { type: String },
  lastSeen: { type: Date },
  macAddress: { type: String },
  manufacturer: { type: String },
  model: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Agent", agentSchema); 