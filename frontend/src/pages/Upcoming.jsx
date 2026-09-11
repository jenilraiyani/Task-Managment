import { useState, useEffect } from 'react';
import { getTasks, getCategories } from '../services/taskService';
import TaskListView from '../components/Tasks/TaskListView';

const Upcoming = () => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await getTasks();
      const todayStr = new Date().setHours(0, 0, 0, 0);
      const today = new Date().toDateString();
      setTasks(
        (res.data || []).filter(
          (t) =>
            t.Deadline &&
            new Date(t.Deadline) > todayStr &&
            new Date(t.Deadline).toDateString() !== today
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
    document.title = 'Upcoming · Taskora';
    fetchTasks();
  }, []);

  return (
    <TaskListView
      title="Upcoming"
      subtitle="Deadlines further down the road"
      tasks={tasks}
      loading={loading}
      onRefresh={fetchTasks}
      categories={categories}
      emptyIcon="bi-calendar-week"
      emptyTitle="No upcoming tasks"
      emptyDescription="Your schedule ahead looks clear."
    />
  );
};

export default Upcoming;
