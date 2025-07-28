const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  companyName: { type: String, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  phoneNumber: { type: String, trim: true },
  passwordHash: { type: String, required: true }, // store hashed password, NOT raw password
  plan: {
    type: String,
    enum: ["Freemium", "Aditya", "Ayush", "Moksha"],
    default: "Freemium",
  },
  role: {
    type: String,
    enum: ["user", "admin", "subadmin"],
    default: "user",
  },
  // Email verification fields
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
  },
  emailVerificationExpires: {
    type: Date,
  },
  createdAt: { type: Date, default: Date.now },
});

// Prevent OverwriteModelError
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
