const Task = require('../models/Task');
const notificationService = require('../services/notificationService');

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { title, description, status, assignedTo, priority } = req.body;

    const task = await Task.create({
      title,
      description,
      status: status || 'To-Do',
      priority: priority || 'Medium',
      assignedTo,
      createdBy: req.user._id
    });

    // Send notification to assigned user
    await notificationService.sendTaskAssignmentNotification(task);

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    let query;

    // If user is not admin, only show tasks assigned to them
    if (req.user.role !== 'admin') {
      query = Task.find({ assignedTo: req.user._id });
    } else {
      query = Task.find({});
    }

    // Add optional filtering by status
    if (req.query.status) {
      query = query.find({ status: req.query.status });
    }

    // Add optional filtering by priority
    if (req.query.priority) {
      query = query.find({ priority: req.query.priority });
    }

    // Populate user data
    query = query.populate({
      path: 'assignedTo',
      select: 'name email'
    }).populate({
      path: 'createdBy',
      select: 'name email'
    });

    // Sort by created date (newest first)
    query = query.sort('-createdAt');

    const tasks = await query;

    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate({
        path: 'assignedTo',
        select: 'name email'
      })
      .populate({
        path: 'createdBy',
        select: 'name email'
      });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Check if user is authorized to view this task
    if (req.user.role !== 'admin' && task.assignedTo._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this task'
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Check if user is authorized to update this task
    if (req.user.role !== 'admin' && task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task'
      });
    }

    const { title, description, status, assignedTo, priority } = req.body;
    
    // Check if task assignment has changed
    const isAssignmentChanged = assignedTo && task.assignedTo.toString() !== assignedTo;

    task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate({
      path: 'assignedTo',
      select: 'name email'
    }).populate({
      path: 'createdBy',
      select: 'name email'
    });

    // Send notification if task assignment has changed
    if (isAssignmentChanged) {
      await notificationService.sendTaskAssignmentNotification(task);
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Check if user is authorized to delete this task
    // Only admins or task creators can delete tasks
    if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this task'
      });
    }

    await task.deleteOne();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask
};