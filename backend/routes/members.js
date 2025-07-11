// routes/members.js
const express = require("express");
const router = express.Router();
const Member = require("../models/Member"); // Import model

router.post("/add-member", async (req, res) => {
  const { name, email, role, department } = req.body;

  try {
    const newMember = new Member({ name, email, role, department });
    await newMember.save();
    res.status(201).json({ message: "Member added successfully" });
  } catch (error) {
    console.error("Error adding member:", error);
    res.status(500).json({ error: "Failed to add member" });
  }
});

module.exports = router;
