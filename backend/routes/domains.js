const express = require("express");
const router = express.Router();
const Domain = require("../models/domain");
const mongoose = require("mongoose");
const User = require("../models/user");
const Plan = require("../models/plan");
// GET all domains
router.get("/", async (req, res) => {
  try {
    const domains = await Domain.find().sort({ createdAt: -1 });
    res.json(domains);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new domain
router.post("/", async (req, res) => {
  const { name, userEmail } = req.body;
  if (!name) return res.status(400).json({ error: "Domain name is required" });
  if (!userEmail) return res.status(400).json({ error: "User email is required" });

  try {
    // Check for existing domain for this user
    const existing = await Domain.findOne({ name, userEmail });
    if (existing) return res.status(409).json({ error: "You have already added this domain." });

    // Fetch user and their plan
    const user = await User.findOne({ email: userEmail });
    if (!user) return res.status(404).json({ error: "User not found" });
    const plan = await Plan.findById(user.plan);
    if (!plan) return res.status(404).json({ error: "Plan not found" });
    const domainLimit = plan.DomainLimit;

    // Count current domains for this user
    const userDomainCount = await Domain.countDocuments({ userEmail });
    if (domainLimit !== -1 && userDomainCount >= domainLimit) {
      return res.status(403).json({ error: `Domain limit reached for your plan (${user.plan}).` });
    }

    const newDomain = new Domain({ name, userEmail });
    await newDomain.save();
    res.status(201).json(newDomain);
  } catch (err) {
    // Handle duplicate key error from MongoDB
    if (err.code === 11000) {
      return res.status(409).json({ error: "You have already added this domain." });
    }
    res.status(500).json({ error: err.message });
  }
});
// DELETE domain by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  console.log("Delete request for ID:", id);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.log("Invalid ID format");
    return res.status(400).json({ error: 'Invalid domain ID' });
  }

  try {
    const deleted = await Domain.findByIdAndDelete(id);
    if (!deleted) {
      console.log("No domain found with this ID");
      return res.status(404).json({ error: 'Domain not found' });
    }
    console.log("Domain deleted:", deleted);
    return res.json({ message: 'Domain deleted successfully' });
  } catch (err) {
    console.error("Error in deletion:", err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
