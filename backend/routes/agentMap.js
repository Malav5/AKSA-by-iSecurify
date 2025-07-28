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
const UserSubadminAssignment = require("../models/UserSubadminAssignment");
const authMiddleware = require("../middleware/authmiddleware");
const { generateVerificationToken, sendVerificationEmail } = require("../utils/emailService");

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

    // STEP 1: Fetch current user's email from JWT token
    let currentUser = null;
    let currentUserEmail = null;
    // Try to extract email from JWT token
    const authHeader = req.headers.authorization;
    let jwtEmail = null;
    if (authHeader) {
      try {
        const token = authHeader.split(" ")[1];
        const jwt = require('jsonwebtoken');
        const decoded = jwt.decode(token);
        jwtEmail = decoded.email;
      } catch (e) {
        // ignore
      }
    }
    // Prefer JWT email, fallback to req.userId lookup if not found
    if (jwtEmail) {
      currentUser = await User.findOne({ email: jwtEmail });
      currentUserEmail = jwtEmail;
    } else if (req.userId) {
      // fallback: try to find by userId
      currentUser = await User.findById(req.userId);
      currentUserEmail = currentUser ? currentUser.email : null;
    }
    if (!currentUser) {
      console.log("Current user not found in database by email or id");
      return res.status(404).json({ error: "Current user not found in database" });
    }
    console.log("Current user found:", {
      _id: currentUser._id,
      email: currentUser.email,
      role: currentUser.role,
      companyName: currentUser.companyName,
      plan: currentUser.plan
    });
    if (currentUser.role !== 'admin' && currentUser.role !== 'subadmin') {
      console.log("Current user doesn't have permission. Role:", currentUser.role);
      return res.status(403).json({ error: "You don't have permission to add users. Only admins and subadmins can add users." });
    }

    // STEP 2: Create new user with current user's company and plan
    const hashed = await bcrypt.hash(password, 10);
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const newUser = new User({
      firstName,
      lastName,
      email,
      passwordHash: hashed,
      role: 'user',
      companyName: currentUser.companyName, // Use current user's company
      plan: currentUser.plan, // Use current user's plan
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      isEmailVerified: false
    });
    await newUser.save();
    console.log("STEP 2: New user created:", {
      _id: newUser._id,
      email: newUser.email,
      companyName: newUser.companyName,
      plan: newUser.plan
    });

    // Send verification email
    const emailSent = await sendVerificationEmail(email, firstName, password, verificationToken);
    if (!emailSent) {
      // If email fails to send, delete the user and return error
      await User.findByIdAndDelete(newUser._id);
      return res.status(500).json({ error: "Failed to send verification email. Please try again." });
    }

    // STEP 3: Store the user with the subadmin (current user) in UserSubadminAssignment
    try {
      console.log("STEP 3: Creating assignment - Current user (subadmin):", {
        subadminId: currentUser._id,
        subadminEmail: currentUser.email,
        subadminRole: currentUser.role
      });
      console.log("STEP 3: New user to be assigned:", {
        userId: newUser._id,
        userEmail: newUser.email
      });
      // Check if assignment already exists for this subadmin
      let assignment = await UserSubadminAssignment.findOne({ subadminId: currentUser._id });
      if (assignment) {
        console.log("Found existing assignment, adding new user to it");
        assignment.userIds.push(newUser._id);
        await assignment.save();
        console.log("User successfully added to existing assignment");
      } else {
        console.log("Creating new assignment for subadmin");
        const newAssignment = new UserSubadminAssignment({
          subadminId: currentUser._id,
          userIds: [newUser._id]
        });
        await newAssignment.save();
        console.log("New assignment created successfully");
      }
      console.log("STEP 3: Assignment completed successfully");
    } catch (assignmentErr) {
      console.error("Failed to create assignment:", assignmentErr);
      console.error("Assignment error details:", {
        message: assignmentErr.message,
        stack: assignmentErr.stack
      });
      // Don't fail the entire operation if assignment fails
    }
    // Success response
    res.status(201).json({
      message: "User added successfully! Verification email has been sent to the user.",
      user: {
        firstName,
        lastName,
        email,
        companyName: currentUser.companyName,
        plan: currentUser.plan
      },
      addedBy: {
        subadminId: currentUser._id,
        subadminEmail: currentUser.email,
        subadminRole: currentUser.role
      }
    });
  } catch (err) {
    console.error("Add user error:", err);
    res.status(500).json({ error: "Failed to add user", details: err.message });
  }
});

// Get all users with role 'user'
router.get("/users-with-role-user", async (req, res) => {
  try {
    const users = await User.find({ role: "user" }, "_id email firstName lastName plan createdAt isEmailVerified");
    const formatted = users.map(u => ({
      _id: u._id,
      email: u.email,
      name: `${u.firstName} ${u.lastName}`.trim(),
      plan: u.plan || "Freemium",
      createdAt: u.createdAt,
      isEmailVerified: u.isEmailVerified
    }));
    res.json({ users: formatted });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users", details: err.message });
  }
});

// Get admin-user assignments (to track which admin added which users)
router.get("/admin-user-assignments", authMiddleware, async (req, res) => {
  try {
    const assignments = await UserSubadminAssignment.find()
      .populate('subadminId', 'firstName lastName email')
      .populate('userIds', 'firstName lastName email createdAt isEmailVerified plan');

    const formattedAssignments = assignments.map(assignment => ({
      admin: {
        _id: assignment.subadminId._id,
        name: `${assignment.subadminId.firstName} ${assignment.subadminId.lastName}`,
        email: assignment.subadminId.email
      },
      users: assignment.userIds.map(user => ({
        _id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        createdAt: user.createdAt,
        isEmailVerified: user.isEmailVerified,
        plan: user.plan || "Freemium"
      })),
      assignmentCreatedAt: assignment.createdAt
    }));

    res.json({ assignments: formattedAssignments });
  } catch (err) {
    console.error("Failed to fetch admin-user assignments:", err);
    res.status(500).json({ error: "Failed to fetch admin-user assignments", details: err.message });
  }
});

// Get users added by specific admin
router.get("/admin-users/:adminId", authMiddleware, async (req, res) => {
  try {
    const { adminId } = req.params;

    const assignment = await UserSubadminAssignment.findOne({ subadminId: adminId })
      .populate('userIds', 'firstName lastName email createdAt isEmailVerified plan');

    if (!assignment) {
      return res.json({ users: [] });
    }

    const users = assignment.userIds.map(user => ({
      _id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      createdAt: user.createdAt,
      isEmailVerified: user.isEmailVerified,
      plan: user.plan
    }));

    res.json({ users });
  } catch (err) {
    console.error("Failed to fetch admin's users:", err);
    res.status(500).json({ error: "Failed to fetch admin's users", details: err.message });
  }
});

// Debug endpoint to check all UserSubadminAssignment records
router.get("/debug-assignments", async (req, res) => {
  try {
    const assignments = await UserSubadminAssignment.find()
      .populate('subadminId', 'firstName lastName email')
      .populate('userIds', 'firstName lastName email');

    res.json({
      count: assignments.length,
      assignments: assignments.map(a => ({
        _id: a._id,
        subadminId: a.subadminId,
        userIds: a.userIds,
        createdAt: a.createdAt
      }))
    });
  } catch (err) {
    console.error("Debug assignments error:", err);
    res.status(500).json({ error: "Failed to fetch assignments", details: err.message });
  }
});

// Debug endpoint to check current user's token
router.get("/debug-current-user", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    // Also check if there are any users in the database
    const allUsers = await User.find({}, '_id email role firstName lastName');

    res.json({
      reqUserId: req.userId,
      user: user ? {
        _id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      } : null,
      allUsers: allUsers.map(u => ({
        _id: u._id,
        email: u.email,
        role: u.role,
        name: `${u.firstName} ${u.lastName}`
      })),
      message: "Current user ID from token and all users in database"
    });
  } catch (err) {
    console.error("Debug current user error:", err);
    res.status(500).json({ error: "Failed to get current user", details: err.message });
  }
});

// Test endpoint to manually create a UserSubadminAssignment
router.post("/test-create-assignment", authMiddleware, async (req, res) => {
  try {
    const { testUserId } = req.body;

    if (!testUserId) {
      return res.status(400).json({ error: "testUserId is required" });
    }

    console.log("Testing assignment creation:", {
      adminId: req.userId,
      testUserId: testUserId
    });

    // Check if assignment already exists for this admin
    let assignment = await UserSubadminAssignment.findOne({ subadminId: req.userId });

    if (assignment) {
      console.log("Found existing assignment, adding test user");
      assignment.userIds.push(testUserId);
      await assignment.save();
      console.log("Test user added to existing assignment");
    } else {
      console.log("Creating new assignment for test");
      const newAssignment = new UserSubadminAssignment({
        subadminId: req.userId,
        userIds: [testUserId]
      });
      await newAssignment.save();
      console.log("New test assignment created");
    }

    res.json({
      message: "Test assignment created successfully",
      adminId: req.userId,
      testUserId: testUserId
    });
  } catch (err) {
    console.error("Test assignment creation error:", err);
    res.status(500).json({ error: "Failed to create test assignment", details: err.message });
  }
});

// Debug endpoint to check JWT token content
router.get("/debug-token", authMiddleware, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];

    // Decode JWT token without verification to see content
    const jwt = require('jsonwebtoken');
    const decoded = jwt.decode(token);

    res.json({
      token: token ? token.substring(0, 20) + "..." : "No token",
      decoded: decoded,
      reqUserId: req.userId,
      message: "JWT token content"
    });
  } catch (err) {
    console.error("Debug token error:", err);
    res.status(500).json({ error: "Failed to decode token", details: err.message });
  }
});

// Upgrade user plan
router.put("/upgrade-user-plan/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { plan } = req.body;
    const currentUserId = req.userId;

    // Get the current user to check their role
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({ error: "Current user not found" });
    }

    // Check if the current user is authorized (admin or subadmin)
    if (currentUser.role !== "admin" && currentUser.role !== "subadmin") {
      return res.status(403).json({ error: "Not authorized to upgrade user plans" });
    }

    // Validate plan
    const validPlans = ["Freemium", "Aditya", "Ayush", "Moksha"];
    if (!validPlans.includes(plan)) {
      return res.status(400).json({ error: "Invalid plan. Must be one of: Freemium, Aditya, Ayush, Moksha" });
    }

    // Find and update the user
    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the user's plan
    userToUpdate.plan = plan;
    await userToUpdate.save();

    res.json({
      message: "Plan upgraded successfully",
      user: {
        _id: userToUpdate._id,
        email: userToUpdate.email,
        name: `${userToUpdate.firstName} ${userToUpdate.lastName}`.trim(),
        plan: userToUpdate.plan
      }
    });
  } catch (err) {
    console.error("Plan upgrade error:", err);
    res.status(500).json({ error: "Failed to upgrade user plan", details: err.message });
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
    // Find the user to get their email
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const userEmail = user.email;

    // Delete all domains for this user (case-insensitive)
    await require('../models/domain').deleteMany({ userEmail: { $regex: `^${userEmail}$`, $options: 'i' } });
    // Delete all agent assignments for this user (case-insensitive)
    await require('../models/AgentUserAssignment').deleteMany({ userEmail: { $regex: `^${userEmail}$`, $options: 'i' } });
    // (Add more deletions here if you have other user-linked collections)

    // Delete the user
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User and all related data deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user and related data" });
  }
});

module.exports = router; 