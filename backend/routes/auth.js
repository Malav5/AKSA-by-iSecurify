const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const authMiddleware = require("../middleware/authmiddleware");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, companyName, email, phoneNumber, password } =
      req.body;

    // Basic validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if email exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      companyName,
      email,
      phoneNumber,
      passwordHash: hashed,
      plan: "Freemium",
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, plan: newUser.plan },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Return token + user payload (same shape as /login)
    return res.status(201).json({
      token,
      user: {
        _id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        companyName: newUser.companyName,
        plan: newUser.plan,
        role: newUser.role, // Add role to response
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Login (unchanged)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id, plan: user.plan },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        companyName: user.companyName,
        plan: user.plan,
        role: user.role, // Add role to response
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Fetch current user (unchanged)
router.get("/user", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-passwordHash");
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json({ user });
  } catch (err) {
    console.error("Fetch user error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Update user plan
router.patch("/update-plan", authMiddleware, async (req, res) => {
  try {
    const { plan } = req.body;
    if (!plan) return res.status(400).json({ error: "Plan is required" });
    const user = await User.findByIdAndUpdate(
      req.userId,
      { plan },
      { new: true }
    ).select("-passwordHash");
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json({ success: true, plan: user.plan });
  } catch (err) {
    console.error("Update plan error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Delete current user account
router.delete("/delete-account", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Prevent subadmin from deleting their own account
    if (user.role === "subadmin") {
      return res.status(403).json({ error: "Subadmins cannot delete their own account." });
    }

    await User.findByIdAndDelete(userId);
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete account" });
  }
});

module.exports = router;
