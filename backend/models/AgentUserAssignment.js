const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  agentName: { type: String, required: true },
  agentId: { type: Number, required: true },
  agentIp: { type: String, required: true },
}, { _id: false });

const agentUserAssignmentSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  userName: { type: String, required: true },
  agents: [agentSchema],
});

module.exports = mongoose.model('AgentUserAssignment', agentUserAssignmentSchema); 