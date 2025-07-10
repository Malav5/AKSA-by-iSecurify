// backend/routes/members.js
const express = require("express");
const router = express.Router();

router.post("/add-member", (req, res) => {
  const { name, email, role, department } = req.body;

  // Example: Save to database here (MongoDB, PostgreSQL, etc.)
//   console.log("Received member data:", req.body);

  res.status(201).json({ message: "Member added successfully" });
});

module.exports = router;
