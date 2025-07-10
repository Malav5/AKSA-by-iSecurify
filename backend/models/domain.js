const mongoose = require("mongoose");

const domainSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userEmail: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// domainSchema.index({ name: 1, userEmail: 1 }, { unique: true });

module.exports = mongoose.model("Domain", domainSchema);
