const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: null },
    priority: { type: String, required: true },
    deadline: { type: Date, default: null },
    startDate: { type: Date, default: null },
    category: { type: String, default: null },
    estimatedMinutes: { type: Number, default: null },
    status: { type: String, default: 'Pending' },
    reminderMinutes: { type: Number, default: null },
    recurrence: { type: String, default: 'One-time' },
    reminderAt: { type: Date, default: null },
    customDays: { type: String, default: null },
    priorityScore: { type: Number, default: null },
    deadlineScore: { type: Number, default: null },
    totalScore: { type: Number, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

taskSchema.index({ status: 1, totalScore: -1, deadline: 1 });

module.exports = mongoose.model('Task', taskSchema);
