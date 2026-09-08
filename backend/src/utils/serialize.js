/**
 * Convert Mongoose docs to the PascalCase API shape the frontend already expects.
 */
const toPlain = (doc) => {
  if (!doc) return null;
  return typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
};

const serializeUser = (doc) => {
  const u = toPlain(doc);
  if (!u) return null;
  return {
    Id: String(u._id),
    id: String(u._id),
    Name: u.name,
    name: u.name,
    Email: u.email,
    email: u.email,
    CreatedAt: u.createdAt,
  };
};

const serializeTask = (doc) => {
  const t = toPlain(doc);
  if (!t) return null;
  return {
    Id: String(t._id),
    UserId: t.userId ? String(t.userId) : null,
    Title: t.title,
    Description: t.description ?? null,
    Priority: t.priority,
    Deadline: t.deadline ?? null,
    StartDate: t.startDate ?? null,
    Category: t.category ?? null,
    EstimatedMinutes: t.estimatedMinutes ?? null,
    Status: t.status,
    ReminderMinutes: t.reminderMinutes ?? null,
    Recurrence: t.recurrence || 'One-time',
    ReminderAt: t.reminderAt ?? null,
    PriorityScore: t.priorityScore ?? null,
    DeadlineScore: t.deadlineScore ?? null,
    TotalScore: t.totalScore ?? null,
    CreatedAt: t.createdAt,
    UpdatedAt: t.updatedAt,
    CompletedAt: t.completedAt ?? null,
  };
};

const serializeCategory = (doc) => {
  const c = toPlain(doc);
  if (!c) return null;
  return {
    Id: String(c._id),
    UserId: c.userId ? String(c.userId) : null,
    Name: c.name,
    CreatedAt: c.createdAt,
  };
};

const serializeNotification = (doc) => {
  const n = toPlain(doc);
  if (!n) return null;
  return {
    Id: String(n._id),
    UserId: n.userId ? String(n.userId) : null,
    TaskId: n.taskId ? String(n.taskId) : null,
    Title: n.title,
    Message: n.message,
    Type: n.type,
    IsRead: Boolean(n.isRead),
    CreatedAt: n.createdAt,
  };
};

module.exports = {
  serializeUser,
  serializeTask,
  serializeCategory,
  serializeNotification,
};
