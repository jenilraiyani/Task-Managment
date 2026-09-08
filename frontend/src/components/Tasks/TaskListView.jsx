import { useMemo, useState } from 'react';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import EmptyState from '../UI/EmptyState';
import LoadingState from '../UI/LoadingState';
import { useSearch } from '../../context/SearchContext';

const PRIORITIES = ['All', 'Critical', 'High', 'Medium', 'Low'];

/**
 * Shared task list view with search, optional priority filters, and edit modal.
 */
const TaskListView = ({
  tasks,
  loading,
  onRefresh,
  categories = [],
  emptyIcon,
  emptyTitle,
  emptyDescription,
  showAdd = false,
  showFilters = false,
}) => {
  const { query } = useSearch();
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((t) => {
      const matchesQuery =
        !q ||
        t.Title?.toLowerCase().includes(q) ||
        t.Description?.toLowerCase().includes(q) ||
        t.Category?.toLowerCase().includes(q);
      const matchesPriority = priorityFilter === 'All' || t.Priority === priorityFilter;
      return matchesQuery && matchesPriority;
    });
  }, [tasks, query, priorityFilter]);

  const openAdd = () => {
    setSelectedTask(null);
    setShowModal(true);
  };

  const openEdit = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  return (
    <div>
      {showAdd && (
        <div className="page-toolbar">
          <div />
          <button className="btn btn-warm" onClick={openAdd}>
            <i className="bi bi-plus-lg me-2"></i>Add Task
          </button>
        </div>
      )}

      {showFilters && (
        <div className="filter-chips">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              type="button"
              className={`filter-chip ${priorityFilter === p ? 'active' : ''}`}
              onClick={() => setPriorityFilter(p)}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <LoadingState label="Loading tasks..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={emptyIcon}
          title={query ? 'No matches' : emptyTitle}
          description={
            query
              ? `Nothing matched “${query}”. Try another search.`
              : emptyDescription
          }
          action={
            showAdd && !query ? (
              <button className="btn btn-outline-primary" onClick={openAdd}>
                + Add your first task
              </button>
            ) : null
          }
        />
      ) : (
        <div className="task-list">
          {filtered.map((task, i) => (
            <div key={task.Id} className="stagger-item" style={{ animationDelay: `${Math.min(i, 10) * 0.04}s` }}>
              <TaskCard task={task} onTaskUpdated={onRefresh} onEdit={openEdit} />
            </div>
          ))}
        </div>
      )}

      <TaskModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        task={selectedTask}
        onTaskSaved={onRefresh}
        categories={categories}
      />
    </div>
  );
};

export default TaskListView;
