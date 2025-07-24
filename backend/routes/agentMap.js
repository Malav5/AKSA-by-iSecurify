const express = require("express");
const router = express.Router();
const Agent = require("../models/Agent");
const User = require("../models/user");
const axios = require("axios");
const https = require("https");
const { getWazuhToken } = require("../wazuh/tokenService");
const apiBaseUrl = process.env.WAZUH_API_URL;
const AgentUserAssignment = require("../models/AgentUserAssignment");
const bcrypt = require('bcryptjs');
const Manager = require("../models/Manager");
const SubadminManagerAssignment = require("../models/SubadminManagerAssignment");
const authMiddleware = require("../middleware/authmiddleware");

// Register agent mapping
router.post("/register-agent", async (req, res) => {
  // Destructure all possible agent fields from req.body
  const {
    agentName,
    agentId,
    agentIp,
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
      user_id
    });
    await agent.save();
    // Sync status in AgentUserAssignment after registering/updating agent
    await syncAgentStatus(agentId, status);
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
    if (user && user.role === "subadmin") {
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
  if (!user || user.role !== "subadmin") {
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
  const { userEmail, userName, agentName, agentId, agentIp, status } = req.body;
  if (!userEmail || !userName || !agentName || !agentId || !agentIp) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const agentIdNum = Number(agentId);
    let assignment = await AgentUserAssignment.findOne({ userEmail });
    const agentObj = { agentName, agentId: agentIdNum, agentIp, status };
    let message = "";
    if (!assignment) {
      assignment = new AgentUserAssignment({
        userEmail,
        userName,
        agents: [agentObj],
      });
      message = "Agent assigned to user";
    } else {
      const idx = assignment.agents.findIndex(a => a.agentId === agentIdNum);
      if (idx === -1) {
        assignment.agents.push(agentObj);
        message = "Agent assigned to user";
      } else {
        if (status && assignment.agents[idx].status !== status) {
          assignment.agents[idx].status = status;
          message = "Agent already assigned, status updated";
        } else {
          message = "Agent already assigned, no changes made";
        }
      }
    }
    await assignment.save();
    res.json({ message, assignment });
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
  if (!user || user.role !== "subadmin") {
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
router.post("/add-user", authMiddleware, async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: "First name, last name, email, and password are required" });
  }
  try {
    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "User with this email already exists" });
    }
    // Fetch admin user to get companyName and plan
    let companyName = undefined;
    let plan = undefined;
    if (req.userId) {
      const admin = await User.findById(req.userId);
      if (admin) {
        if (admin.companyName) companyName = admin.companyName;
        if (admin.plan) plan = admin.plan;
      }
    }
    // Hash the password
    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      email,
      passwordHash: hashed,
      role: 'user',
      companyName, // assign from admin if available
      plan, // assign plan from admin
    });
    await newUser.save();
    res.status(201).json({ message: "User added", user: { firstName, lastName, email, companyName, plan } });
  } catch (err) {
    res.status(500).json({ error: "Failed to add user", details: err.message });
  }
});

// Get all users with role 'user'
router.get("/users-with-role-user", async (req, res) => {
  try {
    const users = await User.find({ role: "user" }, "_id email firstName lastName");
    const formatted = users.map(u => ({
      _id: u._id,
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

// Test endpoint to add a sample Manager document
router.post("/test-add-manager", async (req, res) => {
  try {
    const manager = await Manager.create({
      name: "Test Manager",
      ip: "127.0.0.1",
      apiUrl: "http://127.0.0.1/api",
      baseUrl: "http://127.0.0.1"
    });
    res.status(201).json({ message: "Test manager added", manager });
  } catch (err) {
    res.status(500).json({ error: "Failed to add test manager", details: err.message });
  }
});

// Assign a manager to a subadmin
router.post("/assign-manager-to-subadmin", async (req, res) => {
  const { subadminId, managerId } = req.body;
  if (!subadminId || !managerId) {
    return res.status(400).json({ error: "subadminId and managerId are required" });
  }
  try {
    const subadmin = await User.findById(subadminId);
    const manager = await Manager.findById(managerId);
    if (!subadmin || subadmin.role !== "subadmin") {
      return res.status(404).json({ error: "Subadmin not found or not a subadmin" });
    }
    if (!manager) {
      return res.status(404).json({ error: "Manager not found" });
    }
    let assignment = await SubadminManagerAssignment.findOne({ subadminId, managerId });
    if (!assignment) {
      assignment = new SubadminManagerAssignment({ subadminId, managerId });
      await assignment.save();
    }
    res.status(201).json({ message: "Manager assigned to subadmin", assignment });
  } catch (err) {
    res.status(500).json({ error: "Failed to assign manager", details: err.message });
  }
});

// Get managers assigned to a subadmin
router.get("/subadmin-managers/:subadminId", async (req, res) => {
  try {
    const assignments = await SubadminManagerAssignment.find({ subadminId: req.params.subadminId }).populate("managerId");
    res.json({ assignments });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch assignments", details: err.message });
  }
});

// Get subadmins assigned to a manager
router.get("/manager-subadmins/:managerId", async (req, res) => {
  try {
    const assignments = await SubadminManagerAssignment.find({ managerId: req.params.managerId }).populate("subadminId");
    res.json({ assignments });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch assignments", details: err.message });
  }
});

router.delete("/delete-user/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

module.exports = router; 