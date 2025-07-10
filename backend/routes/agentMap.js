const express = require("express");
const router = express.Router();
const Agent = require("../models/Agent");
const User = require("../models/user");

// Register agent mapping
router.post("/register-agent", async (req, res) => {
  const { agentName, userEmail, user_id } = req.body;
  if (!agentName || !userEmail) {
    return res.status(400).json({ error: "agentName and userEmail are required" });
  }
  try {
    const agent = new Agent({ agentName, userEmail, user_id });
    await agent.save();
    res.status(201).json({ message: "Agent registered successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to register agent", details: err.message });
  }
});

// Get all agent mappings for a user
router.get("/user-agents", async (req, res) => {
  const { userEmail } = req.query;
  if (!userEmail) return res.status(400).json({ error: "userEmail is required" });
  try {
    const agents = await Agent.find({ userEmail });
    res.json({ agents });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch agents", details: err.message });
  }
});

// Get all agents (admin) or only assigned agents (user)
router.get("/agents", async (req, res) => {
  // Assume req.user is set by auth middleware and has role and _id
  const user = req.user;
  try {
    let agents;
    if (user && user.role === "admin") {
      agents = await Agent.find();
    } else if (user) {
      agents = await Agent.find({ user_id: user._id });
    } else {
      return res.status(401).json({ error: "Unauthorized" });
    }
    res.json({ agents });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch agents", details: err.message });
  }
});

// Assign agent to user (admin only)
router.patch("/agents/:id/assign", async (req, res) => {
  const user = req.user;
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Not authorized" });
  }
  const { user_id } = req.body;
  try {
    const agent = await Agent.findByIdAndUpdate(req.params.id, { user_id }, { new: true });
    if (!agent) return res.status(404).json({ error: "Agent not found" });
    res.json(agent);
  } catch (err) {
    res.status(500).json({ error: "Failed to assign agent", details: err.message });
  }
});

// Get all users (for admin assignment UI)
router.get("/users", async (req, res) => {
  const user = req.user;
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Not authorized" });
  }
  try {
    const users = await User.find({}, "_id firstName lastName email");
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users", details: err.message });
  }
});

module.exports = router; 