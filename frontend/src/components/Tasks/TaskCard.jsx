import { useState } from 'react';
import { createPortal } from 'react-dom';
import { updateTask, deleteTask } from '../../services/taskService';
import TaskDetailModal from './TaskDetailModal';

const ConfirmDeleteModal = ({ open, taskTitle, loading, error, onCancel, onConfirm }) => {
  if (!open) return null;

  return createPortal(
    <>
      <div className="modal-backdrop fade show" onClick={loading ? undefined : onCancel} />
      <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '420px' }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #c0352b, #d64545)' }}>
              <h5 className="modal-title">Delete task</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onCancel}
                disabled={loading}
                aria-label="Close"
              />
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <p className="mb-2" style={{ color: 'var(--text-main)' }}>
                Are you sure you want to delete this task?
              </p>
              <p className="mb-0 fw-semibold" style={{ color: 'var(--text-secondary)' }}>
                “{taskTitle}”
              </p>
              <p className="small text-muted mt-2 mb-0">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger-solid" onClick={onConfirm} disabled={loading}>
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

const TaskCard = ({ task, onTaskUpdated, onEdit }) => {
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleToggleComplete = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      await updateTask(task.Id, {
        ...task,
        status: task.Status === 'Completed' ? 'Pending' : 'Completed',
      });
      onTaskUpdated();
    } catch (error) {
      console.error('Failed to update task status', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setLoading(true);
    setDeleteError('');
    try {
      await deleteTask(task.Id);
      setConfirmOpen(false);
      setDetailOpen(false);
      onTaskUpdated();
    } catch (error) {
      console.error('Failed to delete task', error);
      setDeleteError(error.response?.data?.message || 'Failed to delete task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isCompleted = task.Status === 'Completed';
  const isOverdue =
    !isCompleted &&
    task.Deadline &&
    new Date(task.Deadline) < new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <>
      <div
        className={`card task-card task-card-clickable ${isCompleted ? 'task-completed' : ''} ${isOverdue ? 'task-overdue' : ''}`}
        onClick={() => setDetailOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setDetailOpen(true);
          }
        }}
      >
        <div className="card-body p-3">
          <div className="d-flex align-items-center gap-3">
            <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                className="form-check-input task-check"
                checked={isCompleted}
                onChange={handleToggleComplete}
                disabled={loading}
                aria-label={isCompleted ? 'Mark as pending' : 'Mark as completed'}
              />
            </div>

            <div className="flex-grow-1 min-width-0">
              <div className="d-flex justify-content-between align-items-start gap-2">
                <h6
                  className={`mb-1 fw-semibold ${isCompleted ? 'status-completed' : ''}`}
                  style={{ fontSize: '0.98rem', letterSpacing: '-0.01em' }}
                >
                  {task.Title}
                </h6>

                <div className="task-action-row flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="task-action-btn task-action-edit"
                    title="Edit task"
                    aria-label="Edit task"
                    onClick={() => onEdit?.(task)}
                    disabled={loading}
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button
                    type="button"
                    className="task-action-btn task-action-delete"
                    title="Delete task"
                    aria-label="Delete task"
                    onClick={() => {
                      setDeleteError('');
                      setConfirmOpen(true);
                    }}
                    disabled={loading}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>

              <div className="d-flex flex-wrap align-items-center gap-2 mt-1">
                {task.Category && (
                  <span className="badge badge-category" style={{ fontSize: '0.72rem' }}>
                    <i className="bi bi-folder me-1"></i>{task.Category}
                  </span>
                )}
                {task.Recurrence && (
                  <span className="badge badge-recurrence" style={{ fontSize: '0.72rem' }}>
                    <i className="bi bi-arrow-repeat me-1"></i>{task.Recurrence}
                  </span>
                )}
                {task.Priority && (
                  <span className={`badge badge-${task.Priority.toLowerCase()}`} style={{ fontSize: '0.72rem' }}>
                    <i className="bi bi-flag-fill me-1"></i>{task.Priority}
                  </span>
                )}
                {isOverdue && (
                  <span className="badge badge-critical" style={{ fontSize: '0.72rem' }}>
                    <i className="bi bi-exclamation-triangle-fill me-1"></i>Overdue
                  </span>
                )}
                {!isOverdue && task.Deadline && (
                  <span className="text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.78rem' }}>
                    <i className="bi bi-calendar2-check"></i>
                    {new Date(task.Deadline).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                )}
                {!task.Deadline && task.ReminderAt && (
                  <span className="text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.78rem' }}>
                    <i className="bi bi-bell"></i>
                    {new Date(task.ReminderAt).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                )}
                {isCompleted && (
                  <span className="d-flex align-items-center gap-1" style={{ fontSize: '0.78rem', color: 'var(--success)' }}>
                    <i className="bi bi-check-circle-fill"></i> Done
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <TaskDetailModal
        show={detailOpen}
        task={task}
        onClose={() => setDetailOpen(false)}
        onEdit={onEdit}
        onDelete={() => {
          setDeleteError('');
          setConfirmOpen(true);
        }}
      />

      <ConfirmDeleteModal
        open={confirmOpen}
        taskTitle={task.Title}
        loading={loading}
        error={deleteError}
        onCancel={() => !loading && setConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};

export default TaskCard;
