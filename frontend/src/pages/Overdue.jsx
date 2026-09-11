import { useState, useEffect } from 'react';
import { getTasks, getCategories } from '../services/taskService';
import TaskListView from '../components/Tasks/TaskListView';

const Overdue = () => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await getTasks();
      const todayStr = new Date().setHours(0, 0, 0, 0);
      setTasks(
        (res.data || []).filter(
          (t) => t.Status !== 'Completed' && t.Deadline && new Date(t.Deadline) < todayStr
        )
      );
      try {
        const catRes = await getCategories();
        setCategories(catRes.data || []);
      } catch {
        /* optional */
      }
    } catch (error) {
      console.error('Failed to load data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Overdue · Taskora';
    fetchTasks();
  }, []);

  return (
    <TaskListView
      title="Overdue"
      subtitle="Past-due items that still need attention"
      tasks={tasks}
      loading={loading}
      onRefresh={fetchTasks}
      categories={categories}
      emptyIcon="bi-emoji-smile"
      emptyTitle="No overdue tasks"
      emptyDescription="Nice work staying on top of deadlines."
    />
  );
};

export default Overdue;
