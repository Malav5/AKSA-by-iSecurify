const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const authMiddleware = require("../middleware/authmiddleware");
const { generateVerificationToken, sendVerificationEmail, sendResendVerificationEmail } = require("../utils/emailService");

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

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new user with isEmailVerified = false
    const newUser = new User({
      firstName,
      lastName,
      companyName,
      email,
      phoneNumber,
      passwordHash: hashed,
      plan: "Freemium",
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      isEmailVerified: false
    });

    await newUser.save();

    // Send verification email
    const emailSent = await sendVerificationEmail(email, firstName, password, verificationToken);

    if (!emailSent) {
      // If email fails to send, delete the user and return error
      await User.findByIdAndDelete(newUser._id);
      return res.status(500).json({ error: "Failed to send verification email. Please try again." });
    }

    // Return success message
    return res.status(201).json({
      message: "Registration successful! Please check your email to verify your account.",
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Verify email
router.post("/verify-email", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Verification token is required" });
    }

    // Find user with this verification token
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    console.log("Verification attempt:", {
      token: token ? token.substring(0, 10) + "..." : "null",
      userFound: !!user,
      userEmail: user?.email
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired verification token" });
    }

    // Mark email as verified and clear verification token
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Generate JWT token for automatic login
    const jwtToken = jwt.sign(
      { userId: user._id, plan: user.plan },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log("Verification successful:", { email: user.email, userId: user._id });

    return res.json({
      message: "Email verified successfully! Account is now ready to use.",
      token: jwtToken,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        companyName: user.companyName,
        plan: user.plan,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (err) {
    console.error("Email verification error:", err);
    console.error("Error details:", {
      message: err.message,
      stack: err.stack,
      code: err.code,
      keyPattern: err.keyPattern,
      keyValue: err.keyValue
    });
    return res.status(500).json({
      error: "Server error",
      details: err.message,
      code: err.code
    });
  }
});

// Resend verification email
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Generate new verification token
    const newVerificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Send verification email without password
    const emailSent = await sendVerificationEmail(email, "User", "", newVerificationToken);

    if (!emailSent) {
      return res.status(500).json({ error: "Failed to send verification email. Please try again." });
    }

    return res.json({ message: "Verification email sent successfully!" });
  } catch (err) {
    console.error("Resend verification error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Login (updated to check email verification)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        error: "Please verify your email before logging in",
        needsVerification: true,
        email: user.email
      });
    }

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
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Debug endpoint to check temp registrations (remove in production)
router.get("/debug-temp-registrations", (req, res) => {
  try {
    if (!global.tempRegistrations) {
      global.tempRegistrations = {};
    }

    const tempRegistrations = global.tempRegistrations;
    const count = Object.keys(tempRegistrations).length;
    const registrations = Object.keys(tempRegistrations).map(token => ({
      token: token.substring(0, 10) + "...",
      email: tempRegistrations[token].email,
      expires: tempRegistrations[token].verificationExpires,
      firstName: tempRegistrations[token].firstName
    }));

    res.json({
      count,
      registrations,
      globalKeys: Object.keys(global).filter(key => key.includes('temp')),
      tempRegistrationsType: typeof global.tempRegistrations,
      tempRegistrationsKeys: Object.keys(tempRegistrations)
    });
  } catch (err) {
    res.status(500).json({ error: err.message, stack: err.stack });
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

// Get all users (no restrictions)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, "-passwordHash");
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

module.exports = router;
