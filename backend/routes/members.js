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

// Add this route
router.delete("/delete-member/:id", async (req, res) => {
  try {
    await Member.findByIdAndDelete(req.params.id);
    res.json({ message: "Member deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete member" });
  }
});

// Add this new GET route to fetch all members
router.get("/get-members", async (req, res) => {
  try {
    const members = await Member.find();
    res.json({ members }); // send full objects
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch members" });
  }
});


module.exports = router;
