const express = require('express');
const router = express.Router();
const UserSubadminAssignment = require('../models/UserSubadminAssignment');

// Create a new assignment
router.post('/', async (req, res) => {
  try {
    const { subadminId, userIds } = req.body;
    if (!subadminId || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'subadminId and userIds (array) are required.' });
    }
    const assignment = new UserSubadminAssignment({ subadminId, userIds });
    await assignment.save();
    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all assignments
router.get('/', async (req, res) => {
  try {
    const assignments = await UserSubadminAssignment.find()
      .populate('subadminId')
      .populate('userIds');
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get assignment by ID
router.get('/:id', async (req, res) => {
  try {
    const assignment = await UserSubadminAssignment.findById(req.params.id)
      .populate('subadminId')
      .populate('userIds');
    if (!assignment) return res.status(404).json({ error: 'Assignment not found.' });
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update assignment by ID
router.put('/:id', async (req, res) => {
  try {
    const { subadminId, userIds } = req.body;
    const assignment = await UserSubadminAssignment.findByIdAndUpdate(
      req.params.id,
      { subadminId, userIds },
      { new: true, runValidators: true }
    );
    if (!assignment) return res.status(404).json({ error: 'Assignment not found.' });
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete assignment by ID
router.delete('/:id', async (req, res) => {
  try {
    const assignment = await UserSubadminAssignment.findByIdAndDelete(req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found.' });
    res.json({ message: 'Assignment deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 