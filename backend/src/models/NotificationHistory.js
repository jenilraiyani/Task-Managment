const mongoose = require('mongoose');

const notificationHistorySchema = new mongoose.Schema(
  {
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true, index: true },
    reminderType: { type: String, default: null },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

module.exports = mongoose.model('NotificationHistory', notificationHistorySchema);
