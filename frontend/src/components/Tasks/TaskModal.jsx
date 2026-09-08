import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { createTask, updateTask } from '../../services/taskService';

const RECURRENCE_OPTIONS = [
  { value: 'One-time', label: 'One-time' },
  { value: 'Daily', label: 'Daily' },
  { value: 'Custom', label: 'Custom' },
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

/** Build a Date from HH:mm using today (or tomorrow if time already passed). */
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

const toLocalDateValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

/** Combine YYYY-MM-DD + HH:mm into ISO datetime */
const buildFromDayAndTime = (dayStr, timeStr) => {
  if (!dayStr || !timeStr) return null;
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date(`${dayStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
};

const TaskModal = ({ show, handleClose, task, onTaskSaved }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [recurrence, setRecurrence] = useState('One-time');
  const [deadline, setDeadline] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [customDay, setCustomDay] = useState('');
  const [customTime, setCustomTime] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!show) return;
    const existingRecurrence = task?.Recurrence || 'One-time';
    const reminderSource = task?.ReminderAt || task?.Deadline;
    setTitle(task?.Title || '');
    setDescription(task?.Description || '');
    setCategory(task?.Category || '');
    setRecurrence(existingRecurrence);
    setDeadline(toLocalDateTimeValue(task?.Deadline));
    setReminderTime(toLocalTimeValue(task?.ReminderAt));
    setCustomDay(toLocalDateValue(reminderSource));
    setCustomTime(toLocalTimeValue(reminderSource));
    setPriority(task?.Priority || 'Medium');
    setError('');
  }, [show, task]);

  useEffect(() => {
    if (!show) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [show, handleClose]);

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
      if (!customDay || !customTime) {
        setError('Please select a day and reminder time');
        setLoading(false);
        return;
      }
      finalReminderAt = buildFromDayAndTime(customDay, customTime);
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
    };

    try {
      if (task) {
        await updateTask(task.Id, taskData);
      } else {
        await createTask(taskData);
      }
      onTaskSaved();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return createPortal(
    <>
      <div className="modal-backdrop fade show" onClick={handleClose} />
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
      >
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5 className="modal-title" id="task-modal-title">
                {task ? 'Edit task' : 'New task'}
              </h5>
              <button type="button" className="btn-close" onClick={handleClose} aria-label="Close" />
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
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
                  <div className="row mb-3 g-3">
                    <div className="col-md-6">
                      <label className="form-label">Select day *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={customDay}
                        onChange={(e) => setCustomDay(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Reminder time *</label>
                      <input
                        type="time"
                        className="form-control"
                        value={customTime}
                        onChange={(e) => setCustomTime(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="mb-1">
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
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleClose}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : (task ? 'Update task' : 'Create task')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default TaskModal;
