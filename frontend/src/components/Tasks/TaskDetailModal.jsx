import { useEffect } from 'react';
import { createPortal } from 'react-dom';

const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const formatTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
};

const DetailRow = ({ icon, label, value, children }) => (
  <div className="task-detail-row">
    <div className="task-detail-label">
      <i className={`bi ${icon}`}></i>
      <span>{label}</span>
    </div>
    <div className="task-detail-value">{children || value}</div>
  </div>
);

const TaskDetailModal = ({ show, task, onClose, onEdit, onDelete }) => {
  useEffect(() => {
    if (!show) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [show, onClose]);

  if (!show || !task) return null;

  const isCompleted = task.Status === 'Completed';
  const isOverdue =
    !isCompleted &&
    task.Deadline &&
    new Date(task.Deadline) < new Date(new Date().setHours(0, 0, 0, 0));

  return createPortal(
    <>
      <div className="modal-backdrop fade show" onClick={onClose} />
      <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content task-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5 className="modal-title">Task details</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
            </div>

            <div className="modal-body">
              <h3 className="task-detail-title">{task.Title}</h3>

              <div className="task-detail-badges mb-3">
                {task.Status && (
                  <span className={`badge ${isCompleted ? 'badge-low' : isOverdue ? 'badge-critical' : 'badge-medium'}`}>
                    {isOverdue ? 'Overdue' : task.Status}
                  </span>
                )}
                {task.Priority && (
                  <span className={`badge badge-${task.Priority.toLowerCase()}`}>
                    <i className="bi bi-flag-fill me-1"></i>{task.Priority}
                  </span>
                )}
                {task.Recurrence && (
                  <span className="badge badge-recurrence">
                    <i className="bi bi-arrow-repeat me-1"></i>{task.Recurrence}
                  </span>
                )}
                {task.Category && (
                  <span className="badge badge-category">
                    <i className="bi bi-folder me-1"></i>{task.Category}
                  </span>
                )}
              </div>

              <div className="task-detail-section">
                <h6>Description</h6>
                <p className="task-detail-description">
                  {task.Description?.trim() ? task.Description : 'No description provided.'}
                </p>
              </div>

              <div className="task-detail-grid">
                <DetailRow icon="bi-tag" label="Category" value={task.Category || '—'} />
                <DetailRow icon="bi-arrow-repeat" label="Recurrence" value={task.Recurrence || 'One-time'} />
                <DetailRow icon="bi-flag" label="Priority" value={task.Priority || '—'} />
                <DetailRow icon="bi-check2-circle" label="Status" value={isOverdue ? 'Overdue' : (task.Status || '—')} />

                {(task.Recurrence === 'One-time' || task.Deadline) && (
                  <DetailRow icon="bi-calendar-event" label="Due date & time" value={formatDateTime(task.Deadline)} />
                )}

                {task.Recurrence === 'Daily' && (
                  <DetailRow icon="bi-bell" label="Reminder time" value={formatTime(task.ReminderAt)} />
                )}

                {task.Recurrence === 'Custom' && (
                  <>
                    <DetailRow icon="bi-calendar3" label="Selected day" value={formatDateTime(task.ReminderAt || task.Deadline).replace(/,\s*\d{1,2}:\d{2}.*/, '') || '—'} />
                    <DetailRow icon="bi-bell" label="Reminder time" value={formatTime(task.ReminderAt || task.Deadline)} />
                  </>
                )}

                {task.ReminderAt && task.Recurrence !== 'Daily' && task.Recurrence !== 'Custom' && (
                  <DetailRow icon="bi-bell" label="Reminder" value={formatDateTime(task.ReminderAt)} />
                )}

                <DetailRow icon="bi-clock-history" label="Created" value={formatDateTime(task.CreatedAt)} />
                <DetailRow icon="bi-pencil-square" label="Updated" value={formatDateTime(task.UpdatedAt)} />
                {task.CompletedAt && (
                  <DetailRow icon="bi-check-all" label="Completed at" value={formatDateTime(task.CompletedAt)} />
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-danger-solid"
                onClick={() => {
                  onClose();
                  onDelete?.(task);
                }}
              >
                <i className="bi bi-trash me-1"></i>Delete
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  onClose();
                  onEdit?.(task);
                }}
              >
                <i className="bi bi-pencil me-1"></i>Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default TaskDetailModal;
