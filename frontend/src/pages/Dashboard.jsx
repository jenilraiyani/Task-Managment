import { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { AuthContext } from '../context/AuthContext';
import { getTasks, getCategories } from '../services/taskService';
import LoadingState from '../components/UI/LoadingState';
import TaskModal from '../components/Tasks/TaskModal';

ChartJS.register(ArcElement, Tooltip);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await getTasks();
      setTasks(res.data || []);
      try {
        const catRes = await getCategories();
        setCategories(catRes.data || []);
      } catch {
        /* optional */
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'Dashboard · TaskFlow';
    fetchTasks();
  }, [fetchTasks]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.Status === 'Completed').length;
  const pendingTasks = totalTasks - completedTasks;
  const todayStr = new Date().setHours(0, 0, 0, 0);
  const overdueTasks = tasks.filter(
    (t) => t.Status !== 'Completed' && t.Deadline && new Date(t.Deadline) < todayStr
  ).length;
  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const focusTask = tasks.find((t) => t.Status !== 'Completed');

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const chartData = {
    labels: ['Completed', 'Remaining'],
    datasets: [
      {
        data: [completedTasks || 0, Math.max(pendingTasks, 0) || (totalTasks === 0 ? 1 : 0)],
        backgroundColor: ['#0f7a6c', '#e4ecf3'],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const chartOptions = {
    cutout: '78%',
    plugins: { legend: { display: false }, tooltip: { enabled: totalTasks > 0 } },
    animation: { animateRotate: true, duration: 900 },
    maintainAspectRatio: false,
  };

  if (loading) return <LoadingState label="Loading your workspace..." />;

  return (
    <div>
      <div className="page-toolbar">
        <div>
          <h2 className="dash-greeting">
            {getGreeting()}
            {user?.name ? `, ${user.name.split(' ')[0]}` : ''}
          </h2>
          <p className="text-muted mb-0">Here is how your day is shaping up.</p>
        </div>
        <button type="button" className="btn btn-warm" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-lg me-2"></i>Add Task
        </button>
      </div>

      <div className="row g-3 g-lg-4 mb-4">
        {[
          { key: 'total', label: 'Total Tasks', value: totalTasks, icon: 'bi-stack', cls: 'stat-card-total' },
          { key: 'pending', label: 'In Progress', value: pendingTasks, icon: 'bi-hourglass-split', cls: 'stat-card-pending' },
          { key: 'done', label: 'Completed', value: completedTasks, icon: 'bi-check2-circle', cls: 'stat-card-completed' },
          { key: 'overdue', label: 'Overdue', value: overdueTasks, icon: 'bi-alarm', cls: 'stat-card-overdue' },
        ].map((stat, i) => (
          <div className="col-6 col-lg-3 stagger-item" key={stat.key} style={{ animationDelay: `${i * 0.06}s` }}>
            <div className={`card stat-card ${stat.cls} h-100`}>
              <h6>{stat.label}</h6>
              <p className="stat-value">{stat.value}</p>
              <i className={`bi ${stat.icon} stat-card-icon`}></i>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-lg-8 stagger-item">
          <div className="card progress-card h-100">
            <h5 className="fw-bold mb-1" style={{ fontSize: '1.15rem' }}>Productivity</h5>
            <p className="text-muted small mb-4">Overall completion across your workspace</p>

            <div className="progress-ring-wrap">
              <div className="chart-wrap">
                <Doughnut data={chartData} options={chartOptions} />
                <div className="chart-center-label">
                  <div className="chart-pct">{completionPct}%</div>
                  <span>done</span>
                </div>
              </div>
              <div className="flex-grow-1" style={{ minWidth: '180px' }}>
                <p className="text-muted small mb-2">
                  {completedTasks} of {totalTasks} tasks completed
                </p>
                <div className="progress-bar-wrap mb-3">
                  <div className="progress-bar-fill" style={{ width: `${completionPct}%` }} />
                </div>
                <div className="row g-2">
                  <div className="col-4">
                    <div className="mini-stat">
                      <div className="fw-bold" style={{ color: 'var(--success)' }}>{completedTasks}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Done</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="mini-stat">
                      <div className="fw-bold" style={{ color: 'var(--warning)' }}>{pendingTasks}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Open</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="mini-stat">
                      <div className="fw-bold" style={{ color: 'var(--danger)' }}>{overdueTasks}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Late</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4 stagger-item" style={{ animationDelay: '0.1s' }}>
          <div className="card focus-card h-100">
            <h5><i className="bi bi-lightning-charge-fill me-2"></i>Focus now</h5>
            {focusTask ? (
              <div>
                <h6>{focusTask.Title}</h6>
                <div className="mb-2 d-flex flex-wrap gap-2">
                  <span className={`badge badge-${focusTask.Priority?.toLowerCase()}`}>
                    <i className="bi bi-flag-fill me-1"></i>{focusTask.Priority}
                  </span>
                  {focusTask.Deadline && (
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)' }}>
                      <i className="bi bi-calendar2 me-1"></i>
                      {new Date(focusTask.Deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
                <p>{focusTask.Description || 'No description — open the task list to dig in.'}</p>
                <Link to="/tasks" className="btn-focus">
                  <i className="bi bi-arrow-right me-2"></i>View all tasks
                </Link>
              </div>
            ) : (
              <div className="text-center py-4">
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.9 }}>
                  <i className="bi bi-emoji-smile"></i>
                </div>
                <p className="mb-0" style={{ color: 'rgba(255,255,255,0.78)' }}>
                  All clear. Enjoy the quiet stretch.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <TaskModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        task={null}
        onTaskSaved={fetchTasks}
        categories={categories}
      />
    </div>
  );
};

export default Dashboard;
