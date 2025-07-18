const express = require('express');
const router = express.Router();
const SubadminManagerAssignment = require('../models/SubadminManagerAssignment');

// Create a new assignment
router.post('/', async (req, res) => {
  try {
    const { subadminId, managerId } = req.body;
    if (!subadminId || !managerId) {
      return res.status(400).json({ error: 'subadminId and managerId are required.' });
    }
    const assignment = new SubadminManagerAssignment({ subadminId, managerId });
    await assignment.save();
    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all assignments
router.get('/', async (req, res) => {
  try {
    const assignments = await SubadminManagerAssignment.find().populate('subadminId').populate('managerId');
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get assignment by ID
router.get('/:id', async (req, res) => {
  try {
    const assignment = await SubadminManagerAssignment.findById(req.params.id).populate('subadminId').populate('managerId');
    if (!assignment) return res.status(404).json({ error: 'Assignment not found.' });
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update assignment by ID
router.put('/:id', async (req, res) => {
  try {
    const { subadminId, managerId } = req.body;
    const assignment = await SubadminManagerAssignment.findByIdAndUpdate(
      req.params.id,
      { subadminId, managerId },
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
    const assignment = await SubadminManagerAssignment.findByIdAndDelete(req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found.' });
    res.json({ message: 'Assignment deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 