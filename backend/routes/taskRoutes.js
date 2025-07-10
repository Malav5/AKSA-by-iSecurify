const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// POST /api/tasks/create-task - Create a task
router.post('/create-task', async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json({ message: 'Task created successfully', task });
  } catch (err) {
    res.status(500).json({ message: 'Error creating task', error: err.message });
  }
});

// GET /api/tasks/get-all-tasks - Get all tasks
router.get('/get-all-tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tasks', error: err.message });
  }
});

// DELETE /api/tasks/delete-task/:id - Delete a task by ID
router.delete('/delete-task/:id', async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json({ message: 'Task deleted successfully', task: deletedTask });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting task', error: err.message });
  }
});

// PUT /api/tasks/update-task/:id - Update a task by ID
router.put('/update-task/:id', async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json({ message: 'Task updated successfully', task: updatedTask });
  } catch (err) {
    res.status(500).json({ message: 'Error updating task', error: err.message });
  }
});

module.exports = router;
