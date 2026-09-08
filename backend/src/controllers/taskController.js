const mongoose = require('mongoose');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const NotificationHistory = require('../models/NotificationHistory');
const { calculateTotalScore } = require('../services/priorityService');
const { serializeTask } = require('../utils/serialize');

const ALLOWED_RECURRENCE = ['One-time', 'Daily', 'Custom'];

const normalizeRecurrence = (value) => {
  if (!value) return 'One-time';
  const match = ALLOWED_RECURRENCE.find(
    (item) => item.toLowerCase() === String(value).toLowerCase()
  );
  return match || 'One-time';
};

const parseOptionalDate = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ userId: req.user.id }).sort({
      status: 1,
      totalScore: -1,
      deadline: 1,
      priorityScore: -1,
      estimatedMinutes: -1,
      createdAt: 1,
    });

    res.json({ success: true, data: tasks.map(serializeTask) });
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      priority,
      deadline,
      startDate,
      category,
      estimatedMinutes,
      status,
      reminderMinutes,
      recurrence,
      reminderAt,
    } = req.body;

    if (!title || !priority) {
      res.status(400);
      throw new Error('Title and priority are required');
    }

    const taskRecurrence = normalizeRecurrence(recurrence);
    const taskStatus = status || 'Pending';
    const parsedDeadline = parseOptionalDate(deadline);
    const parsedStartDate = parseOptionalDate(startDate);
    const parsedReminderAt = parseOptionalDate(reminderAt);

    if (taskRecurrence === 'One-time' && !parsedDeadline) {
      res.status(400);
      throw new Error('Due date and time are required for one-time tasks');
    }
    if (taskRecurrence === 'Daily' && !parsedReminderAt) {
      res.status(400);
      throw new Error('Reminder time is required for daily tasks');
    }
    if (taskRecurrence === 'Custom' && !parsedDeadline && !parsedReminderAt) {
      res.status(400);
      throw new Error('Day and reminder time are required for custom tasks');
    }

    const { priorityScore, deadlineScore, totalScore } = calculateTotalScore(
      priority,
      parsedDeadline || parsedReminderAt,
      taskStatus
    );

    const task = await Task.create({
      userId: req.user.id,
      title,
      description: description || null,
      priority,
      deadline: parsedDeadline,
      startDate: parsedStartDate,
      category: category || null,
      estimatedMinutes: estimatedMinutes || null,
      status: taskStatus,
      reminderMinutes: reminderMinutes || null,
      recurrence: taskRecurrence,
      reminderAt: parsedReminderAt,
      priorityScore,
      deadlineScore,
      totalScore,
    });

    // Instant inbox message when a task is created
    try {
      const Notification = require('../models/Notification');
      let message = `"${title}" was added to your tasks.`;
      if (taskRecurrence === 'Daily' && parsedReminderAt) {
        message = `"${title}" was added with a daily reminder.`;
      } else if (taskRecurrence === 'Custom' && parsedReminderAt) {
        message = `"${title}" was added with a custom reminder.`;
      } else if (parsedDeadline) {
        message = `"${title}" was added. Due ${parsedDeadline.toLocaleString()}.`;
      }
      await Notification.create({
        userId: req.user.id,
        taskId: task._id,
        title: 'New Task',
        message,
        type: 'Info',
      });
    } catch (notifyErr) {
      console.error('Failed to create task notification', notifyErr);
    }

    res.status(201).json({ success: true, data: serializeTask(task) });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error('Invalid task id');
    }

    const existingTask = await Task.findOne({ _id: id, userId: req.user.id });
    if (!existingTask) {
      res.status(404);
      throw new Error('Task not found');
    }

    const title = req.body.title || existingTask.title;
    const description = req.body.description !== undefined ? req.body.description : existingTask.description;
    const priority = req.body.priority || existingTask.priority;
    const deadline = req.body.deadline !== undefined ? req.body.deadline : existingTask.deadline;
    const startDate = req.body.startDate !== undefined ? req.body.startDate : existingTask.startDate;
    const category = req.body.category !== undefined ? req.body.category : existingTask.category;
    const estimatedMinutes = req.body.estimatedMinutes !== undefined ? req.body.estimatedMinutes : existingTask.estimatedMinutes;
    const status = req.body.status || existingTask.status;
    const reminderMinutes = req.body.reminderMinutes !== undefined ? req.body.reminderMinutes : existingTask.reminderMinutes;
    const recurrence = req.body.recurrence !== undefined
      ? normalizeRecurrence(req.body.recurrence)
      : (existingTask.recurrence || 'One-time');
    const reminderAt = req.body.reminderAt !== undefined ? req.body.reminderAt : existingTask.reminderAt;

    const parsedDeadline = parseOptionalDate(deadline);
    const parsedStartDate = parseOptionalDate(startDate);
    const parsedReminderAt = parseOptionalDate(reminderAt);

    const { priorityScore, deadlineScore, totalScore } = calculateTotalScore(
      priority,
      parsedDeadline || parsedReminderAt,
      status
    );

    let completedAt = existingTask.completedAt;
    if (status === 'Completed' && existingTask.status !== 'Completed') {
      completedAt = new Date();
    } else if (status !== 'Completed') {
      completedAt = null;
    }

    existingTask.title = title;
    existingTask.description = description;
    existingTask.priority = priority;
    existingTask.deadline = parsedDeadline;
    existingTask.startDate = parsedStartDate;
    existingTask.category = category;
    existingTask.estimatedMinutes = estimatedMinutes;
    existingTask.status = status;
    existingTask.reminderMinutes = reminderMinutes;
    existingTask.recurrence = recurrence;
    existingTask.reminderAt = parsedReminderAt;
    existingTask.priorityScore = priorityScore;
    existingTask.deadlineScore = deadlineScore;
    existingTask.totalScore = totalScore;
    existingTask.completedAt = completedAt;

    await existingTask.save();

    res.json({ success: true, data: serializeTask(existingTask) });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      res.status(400);
      throw new Error('Invalid task id');
    }

    const existing = await Task.findOne({ _id: taskId, userId: req.user.id });
    if (!existing) {
      res.status(404);
      throw new Error('Task not found');
    }

    await NotificationHistory.deleteMany({ taskId });
    await Notification.deleteMany({ taskId });
    await Task.deleteOne({ _id: taskId });

    res.json({ success: true, message: 'Task deleted successfully', data: { id: taskId } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};
