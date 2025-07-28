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

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store registration data temporarily (in memory or temporary storage)
    // For now, we'll store it in a temporary object - in production you might want to use Redis or similar
    const tempRegistrationData = {
      firstName,
      lastName,
      companyName,
      email,
      phoneNumber,
      password,
      verificationToken,
      verificationExpires,
      createdAt: new Date()
    };

    // Store in temporary storage (you might want to use Redis in production)
    global.tempRegistrations = global.tempRegistrations || {};
    global.tempRegistrations[verificationToken] = tempRegistrationData;

    // Send verification email
    const emailSent = await sendVerificationEmail(email, firstName, password, verificationToken);

    if (!emailSent) {
      // If email fails to send, remove from temp storage
      delete global.tempRegistrations[verificationToken];
      return res.status(500).json({ error: "Failed to send verification email. Please try again." });
    }

    // Return success message without creating user in database yet
    return res.status(201).json({
      message: "Registration initiated! Please check your email to verify your account and complete registration.",
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

    // Check if token exists in temporary registrations
    const tempRegistration = global.tempRegistrations?.[token];

    if (!tempRegistration) {
      return res.status(400).json({ error: "Invalid or expired verification token" });
    }

    // Check if token has expired
    if (new Date() > tempRegistration.verificationExpires) {
      // Remove expired registration
      delete global.tempRegistrations[token];
      return res.status(400).json({ error: "Verification token has expired" });
    }

    // Check if user already exists (in case of duplicate registration attempts)
    const existingUser = await User.findOne({ email: tempRegistration.email });
    if (existingUser) {
      // Remove from temp storage
      delete global.tempRegistrations[token];
      return res.status(400).json({ error: "User already exists with this email" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(tempRegistration.password, 10);

    // Create new user in database
    const newUser = new User({
      firstName: tempRegistration.firstName,
      lastName: tempRegistration.lastName,
      companyName: tempRegistration.companyName,
      email: tempRegistration.email,
      phoneNumber: tempRegistration.phoneNumber,
      passwordHash: hashedPassword,
      plan: "Freemium",
      isEmailVerified: true, // User is verified since they clicked the link
      createdAt: tempRegistration.createdAt
    });

    await newUser.save();

    // Remove from temporary storage
    delete global.tempRegistrations[token];

    // Generate JWT token for automatic login
    const jwtToken = jwt.sign(
      { userId: newUser._id, plan: newUser.plan },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Email verified successfully! Account created and ready to use.",
      token: jwtToken,
      user: {
        _id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        companyName: newUser.companyName,
        plan: newUser.plan,
        role: newUser.role,
        isEmailVerified: newUser.isEmailVerified,
      },
    });
  } catch (err) {
    console.error("Email verification error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Resend verification email
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if user already exists in database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists. Please login instead." });
    }

    // Find the registration in temporary storage
    const tempRegistrations = global.tempRegistrations || {};
    const existingRegistration = Object.values(tempRegistrations).find(reg => reg.email === email);

    if (!existingRegistration) {
      return res.status(404).json({ error: "No pending registration found for this email. Please register first." });
    }

    // Generate new verification token
    const newVerificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Generate a new password
    const newPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).toUpperCase().slice(-4) + "!1";

    // Remove old registration and create new one
    const oldToken = Object.keys(tempRegistrations).find(key => tempRegistrations[key].email === email);
    if (oldToken) {
      delete tempRegistrations[oldToken];
    }

    // Create new temporary registration with updated data
    const updatedRegistration = {
      ...existingRegistration,
      password: newPassword,
      verificationToken: newVerificationToken,
      verificationExpires: verificationExpires,
      createdAt: new Date()
    };

    tempRegistrations[newVerificationToken] = updatedRegistration;

    // Send verification email with new password
    const emailSent = await sendVerificationEmail(email, existingRegistration.firstName, newPassword, newVerificationToken);

    if (!emailSent) {
      // Remove from temp storage if email fails
      delete tempRegistrations[newVerificationToken];
      return res.status(500).json({ error: "Failed to send verification email. Please try again." });
    }

    return res.json({ message: "Verification email sent successfully! Your password has been reset and included in the email." });
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
