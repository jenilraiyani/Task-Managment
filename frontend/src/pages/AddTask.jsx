import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createTask, updateTask } from '../services/taskService';

const RECURRENCE_OPTIONS = [
  { value: 'One-time', label: 'One-time' },
  { value: 'Daily', label: 'Daily' },
  { value: 'Custom', label: 'Custom' },
];

const DAYS_OF_WEEK = [
  { value: 'Sun', label: 'S', full: 'Sunday' },
  { value: 'Mon', label: 'M', full: 'Monday' },
  { value: 'Tue', label: 'T', full: 'Tuesday' },
  { value: 'Wed', label: 'W', full: 'Wednesday' },
  { value: 'Thu', label: 'T', full: 'Thursday' },
  { value: 'Fri', label: 'F', full: 'Friday' },
  { value: 'Sat', label: 'S', full: 'Saturday' },
];

const PRIORITY_OPTIONS = ['Critical', 'High', 'Medium', 'Low'];

const toLocalDateTimeValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const toLocalTimeValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const buildReminderFromTime = (timeStr) => {
  if (!timeStr) return null;
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setSeconds(0, 0);
  date.setHours(hours, minutes, 0, 0);
  if (date.getTime() < Date.now()) {
    date.setDate(date.getDate() + 1);
  }
  return date.toISOString();
};

const DAY_INDEX_MAP = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

const getNextOccurrence = (dayAbbrevs, timeStr) => {
  if (!dayAbbrevs || !dayAbbrevs.length || !timeStr) return null;
  const [hours, minutes] = timeStr.split(':').map(Number);
  const now = new Date();
  const today = now.getDay();
  
  let minDaysAhead = 7;
  
  for (const dayAbbrev of dayAbbrevs) {
    const targetDay = DAY_INDEX_MAP[dayAbbrev];
    if (targetDay === undefined) continue;
    
    let daysAhead = targetDay - today;
    if (daysAhead < 0) daysAhead += 7;
    if (daysAhead === 0) {
      const check = new Date();
      check.setHours(hours, minutes, 0, 0);
      if (check.getTime() <= now.getTime()) daysAhead = 7;
    }
    if (daysAhead < minDaysAhead) {
      minDaysAhead = daysAhead;
    }
  }
  
  const result = new Date();
  result.setDate(result.getDate() + minDaysAhead);
  result.setHours(hours, minutes, 0, 0);
  return result.toISOString();
};

const getDaysFromCustomDays = (task) => {
  const daysStr = task?.customDays || task?.CustomDays;
  if (daysStr) return daysStr.split(',');
  if (!task?.ReminderAt && !task?.Deadline) return [];
  const date = new Date(task.ReminderAt || task.Deadline);
  if (Number.isNaN(date.getTime())) return [];
  return [['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]];
};

const AddTask = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const task = location.state?.task || null;
  const returnTo = location.state?.returnTo || '/dashboard';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [recurrence, setRecurrence] = useState('One-time');
  const [deadline, setDeadline] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [customDay, setCustomDay] = useState('');
  const [customTime, setCustomTime] = useState('');
  const [selectedWeekdays, setSelectedWeekdays] = useState([]);
  const [priority, setPriority] = useState('Medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = task ? 'Edit Task · Taskora' : 'New Task · Taskora';
    const existingRecurrence = task?.Recurrence || 'One-time';
    const reminderSource = task?.ReminderAt || task?.Deadline;
    setTitle(task?.Title || '');
    setDescription(task?.Description || '');
    setCategory(task?.Category || '');
    setRecurrence(existingRecurrence);
    setDeadline(toLocalDateTimeValue(task?.Deadline));
    setReminderTime(toLocalTimeValue(task?.ReminderAt));
    setCustomDay('');
    setCustomTime(toLocalTimeValue(reminderSource));
    setSelectedWeekdays(getDaysFromCustomDays(task));
    setPriority(task?.Priority || 'Medium');
    setError('');
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let finalDeadline = null;
    let finalReminderAt = null;

    if (recurrence === 'One-time') {
      if (!deadline) {
        setError('Please set due date and time');
        setLoading(false);
        return;
      }
      finalDeadline = new Date(deadline).toISOString();
    } else if (recurrence === 'Daily') {
      if (!reminderTime) {
        setError('Please set reminder time');
        setLoading(false);
        return;
      }
      finalReminderAt = buildReminderFromTime(reminderTime);
    } else {
      if (selectedWeekdays.length === 0 || !customTime) {
        setError('Please select at least one day and reminder time');
        setLoading(false);
        return;
      }
      finalReminderAt = getNextOccurrence(selectedWeekdays, customTime);
      finalDeadline = finalReminderAt;
      if (!finalReminderAt) {
        setError('Invalid day or reminder time');
        setLoading(false);
        return;
      }
    }

    const taskData = {
      title: title.trim(),
      description: description.trim() || null,
      category: category.trim() || null,
      recurrence,
      priority,
      deadline: finalDeadline,
      reminderAt: finalReminderAt,
      customDays: recurrence === 'Custom' ? selectedWeekdays.join(',') : null,
    };

    try {
      if (task) {
        await updateTask(task.Id, taskData);
      } else {
        await createTask(taskData);
      }
      navigate(returnTo);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-task-page">
      <form onSubmit={handleSubmit} className="add-task-form">
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="mb-3">
          <label className="form-label">Task title *</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="What needs to be done?"
            autoFocus
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add details..."
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Category</label>
          <input
            type="text"
            className="form-control"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Type a category (e.g. Work, Study)"
            maxLength={100}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Recurrence *</label>
          <div className="recurrence-toggle" role="group" aria-label="Recurrence">
            {RECURRENCE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`recurrence-btn ${recurrence === option.value ? 'active' : ''}`}
                onClick={() => setRecurrence(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {recurrence === 'One-time' && (
          <div className="mb-3">
            <label className="form-label">Due date & time *</label>
            <input
              type="datetime-local"
              className="form-control"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </div>
        )}

        {recurrence === 'Daily' && (
          <div className="mb-3">
            <label className="form-label">Reminder time *</label>
            <input
              type="time"
              className="form-control"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              required
            />
            <p className="form-hint">This reminder will repeat every day at this time.</p>
          </div>
        )}

        {recurrence === 'Custom' && (
          <div className="mb-3 custom-recurrence-card">
            <label className="form-label d-block text-center mb-3">Repeats every</label>
            <div className="day-picker-container mb-4">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day.value} className="day-picker-wrapper">
                  <input
                    type="checkbox"
                    id={`day-${day.value}`}
                    name="customDay"
                    value={day.value}
                    className="day-picker-toggle"
                    checked={selectedWeekdays.includes(day.value)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setSelectedWeekdays(prev => 
                        checked ? [...prev, day.value] : prev.filter(d => d !== day.value)
                      );
                    }}
                  />
                  <label htmlFor={`day-${day.value}`} className="day-picker-btn" title={day.full}>
                    {day.label}
                  </label>
                </div>
              ))}
            </div>
            {selectedWeekdays.length > 0 && (
              <p className="text-center text-primary fw-medium mb-3">
                <i className="bi bi-arrow-repeat me-1"></i>
                Repeats every {selectedWeekdays.map(d => DAYS_OF_WEEK.find(day => day.value === d)?.full).join(', ')}
              </p>
            )}
            <label className="form-label text-center d-block">Reminder time *</label>
            <input
              type="time"
              className="form-control text-center mx-auto"
              style={{ maxWidth: '150px' }}
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              required
            />
          </div>
        )}

        <div className="mb-3">
          <label className="form-label">Priority *</label>
          <div className="priority-toggle" role="group" aria-label="Priority">
            {PRIORITY_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                className={`priority-btn priority-${option.toLowerCase()} ${priority === option ? 'active' : ''}`}
                onClick={() => setPriority(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="add-task-form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(returnTo)}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : (task ? 'Update Task' : 'Create Task')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTask;
