const Task = require('../models/Task');
const Notification = require('../models/Notification');
const NotificationHistory = require('../models/NotificationHistory');

const createNotificationOnce = async ({ userId, taskId, title, message, type, reminderType }) => {
  const alreadySent = await NotificationHistory.findOne({ taskId, reminderType });
  if (alreadySent) return false;

  await Notification.create({
    userId,
    taskId,
    title,
    message,
    type,
  });

  await NotificationHistory.create({
    taskId,
    reminderType,
  });

  return true;
};

const checkAndSendReminders = async () => {
  try {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    // Legacy: ReminderMinutes before Deadline
    const legacyTasks = await Task.find({
      status: { $ne: 'Completed' },
      reminderMinutes: { $ne: null },
      deadline: { $ne: null, $gt: now },
    });

    for (const task of legacyTasks) {
      const remindAt = new Date(task.deadline.getTime() - task.reminderMinutes * 60 * 1000);
      if (remindAt > now) continue;

      await createNotificationOnce({
        userId: task.userId,
        taskId: task._id,
        title: 'Task Reminder',
        message: `"${task.title}" is due in ${task.reminderMinutes} minutes.`,
        type: 'Reminder',
        reminderType: `${task.reminderMinutes}m`,
      });
    }

    // ReminderAt for Daily / Custom / scheduled reminders
    const dueReminders = await Task.find({
      status: { $ne: 'Completed' },
      reminderAt: { $ne: null, $lte: now },
    });

    for (const task of dueReminders) {
      const reminderKey = `at-${task.reminderAt.toISOString()}`;
      const created = await createNotificationOnce({
        userId: task.userId,
        taskId: task._id,
        title: 'Task Reminder',
        message: `"${task.title}" reminder is due now.`,
        type: 'Reminder',
        reminderType: reminderKey,
      });

      if (!created) {
        // Already notified for this exact ReminderAt — still advance daily
      }

      if (task.recurrence === 'Daily') {
        const next = new Date(task.reminderAt);
        next.setDate(next.getDate() + 1);
        task.reminderAt = next;
        await task.save();
      } else {
        task.reminderAt = null;
        await task.save();
      }
    }

    // Overdue tasks (deadline before today, still pending)
    const overdueTasks = await Task.find({
      status: { $ne: 'Completed' },
      deadline: { $ne: null, $lt: startOfToday },
    });

    for (const task of overdueTasks) {
      const dayKey = startOfToday.toISOString().slice(0, 10);
      await createNotificationOnce({
        userId: task.userId,
        taskId: task._id,
        title: 'Task Overdue',
        message: `"${task.title}" is overdue. Please complete it soon.`,
        type: 'Overdue',
        reminderType: `overdue-${dayKey}`,
      });
    }

    // Due today reminders (once per day)
    const endOfToday = new Date(startOfToday);
    endOfToday.setHours(23, 59, 59, 999);

    const dueTodayTasks = await Task.find({
      status: { $ne: 'Completed' },
      deadline: { $gte: startOfToday, $lte: endOfToday },
    });

    for (const task of dueTodayTasks) {
      const dayKey = startOfToday.toISOString().slice(0, 10);
      await createNotificationOnce({
        userId: task.userId,
        taskId: task._id,
        title: 'Due Today',
        message: `"${task.title}" is due today.`,
        type: 'DueToday',
        reminderType: `due-today-${dayKey}`,
      });
    }
  } catch (error) {
    console.error('Error in checkAndSendReminders:', error);
  }
};

module.exports = {
  checkAndSendReminders,
};
