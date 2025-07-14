const express = require("express");
const router = express.Router();
const Agent = require("../models/Agent");
const User = require("../models/user");
const axios = require("axios");
const https = require("https");
const { getWazuhToken } = require("../wazuh/tokenService");
const apiBaseUrl = process.env.WAZUH_API_URL;
const AgentUserAssignment = require("../models/AgentUserAssignment");

// Register agent mapping
router.post("/register-agent", async (req, res) => {
  // Destructure all possible agent fields from req.body
  const {
    agentName,
    agentId,
    agentIp,
    deviceType,
    status,
    hostname,
    os,
    lastSeen,
    macAddress,
    manufacturer,
    model,
    createdAt,
    userEmail,
    user_id
  } = req.body;

  // agentName, agentId, and agentIp are required
  if (!agentName || !agentId || !agentIp) {
    return res.status(400).json({ error: "agentName, agentId, and agentIp are required" });
  }
  try {
    const agent = new Agent({
      agentName,
      agentId,
      agentIp,
      deviceType,
      status,
      hostname,
      os,
      lastSeen,
      macAddress,
      manufacturer,
      model,
      createdAt,
      userEmail,
      user_id
    });
    await agent.save();
    res.status(201).json({ message: "Agent registered successfully", agent });
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

// Assign agent to user
router.post("/assign-agent-to-user", async (req, res) => {
  const { userEmail, userName, agentName, agentId, agentIp } = req.body;
  if (!userEmail || !userName || !agentName || !agentId || !agentIp) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    let assignment = await AgentUserAssignment.findOne({ userEmail });
    if (!assignment) {
      assignment = new AgentUserAssignment({
        userEmail,
        userName,
        agents: [{ agentName, agentId, agentIp }],
      });
    } else {
      // Only add agent if not already assigned
      const exists = assignment.agents.some(a => a.agentId === agentId);
      if (!exists) {
        assignment.agents.push({ agentName, agentId, agentIp });
      }
    }
    await assignment.save();
    res.json({ message: "Agent assigned to user", assignment });
  } catch (err) {
    res.status(500).json({ error: "Failed to assign agent", details: err.message });
  }
});

// Sync agents from Wazuh API to MongoDB
router.get("/sync-wazuh-agents", async (req, res) => {
  try {
    const token = await getWazuhToken();
    const response = await axios.get(`${apiBaseUrl}/agents`, {
      headers: { Authorization: `Bearer ${token}` },
      httpsAgent: new https.Agent({ rejectUnauthorized: false })
    });
    const wazuhAgents = response.data.data.affected_items || [];
    const results = [];
    for (const agent of wazuhAgents) {
      // Map Wazuh agent fields to Agent model
      const mapped = {
        agentName: agent.name,
        agentId: Number(agent.id),
        agentIp: agent.ip || (agent.registerIP || ""),
        status: agent.status,
        hostname: agent.name,
        lastSeen: agent.lastKeepAlive ? new Date(agent.lastKeepAlive) : undefined,
        createdAt: agent.dateAdd ? new Date(agent.dateAdd) : undefined,
      };
      // Optionally fetch more details (e.g., sysinfo) if needed
      // Upsert agent in MongoDB
      const saved = await Agent.findOneAndUpdate(
        { agentId: mapped.agentId },
        mapped,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      results.push(saved);
    }
    res.json({ message: "Wazuh agents synced to MongoDB", count: results.length });
  } catch (err) {
    res.status(500).json({ error: "Failed to sync Wazuh agents", details: err.message });
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

// Add user (from AddUserModal)
router.post("/add-user", async (req, res) => {
  const { firstName, lastName, email } = req.body;
  if (!firstName || !lastName || !email) {
    return res.status(400).json({ error: "First name, last name, and email are required" });
  }
  try {
    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "User with this email already exists" });
    }
    const newUser = new User({
      firstName,
      lastName,
      email,
      passwordHash: 'placeholder', // You may want to set/reset this later
      role: 'user',
    });
    await newUser.save();
    res.status(201).json({ message: "User added", user: { firstName, lastName, email } });
  } catch (err) {
    res.status(500).json({ error: "Failed to add user", details: err.message });
  }
});

// Get all users with role 'user'
router.get("/users-with-role-user", async (req, res) => {
  try {
    const users = await User.find({ role: "user" }, "email firstName lastName");
    const formatted = users.map(u => ({
      email: u.email,
      name: `${u.firstName} ${u.lastName}`.trim()
    }));
    res.json({ users: formatted });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users", details: err.message });
  }
});

// Get assigned agents for a user by email
router.get("/assigned-agents", async (req, res) => {
  const { userEmail } = req.query;
  if (!userEmail) return res.status(400).json({ error: "userEmail is required" });
  try {
    const assignment = await AgentUserAssignment.findOne({ userEmail });
    if (!assignment || !assignment.agents) {
      return res.json({ agents: [] });
    }
    res.json({ agents: assignment.agents });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch assigned agents", details: err.message });
  }
});

// Get assigned agents details (full agent details)
router.get("/assigned-agents-details", async (req, res) => {
  const { userEmail } = req.query;
  if (!userEmail) return res.status(400).json({ error: "userEmail is required" });
  try {
    const assignment = await AgentUserAssignment.findOne({ userEmail });
    if (!assignment || !assignment.agents) {
      return res.json({ agents: [] });
    }
    // Get all agentIds assigned to this user
    const agentIds = assignment.agents.map(a => a.agentId);
    // Fetch agent details from Agent collection
    const agents = await Agent.find({ agentId: { $in: agentIds } });
    res.json({ agents });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch assigned agent details", details: err.message });
  }
});

module.exports = router; 