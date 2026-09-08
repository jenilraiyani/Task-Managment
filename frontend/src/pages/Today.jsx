import { useState, useEffect } from 'react';
import { getTasks, getCategories } from '../services/taskService';
import TaskListView from '../components/Tasks/TaskListView';

const Today = () => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await getTasks();
      const todayStr = new Date().toDateString();
      setTasks((res.data || []).filter((t) => t.Deadline && new Date(t.Deadline).toDateString() === todayStr));
      try {
        const catRes = await getCategories();
        setCategories(catRes.data || []);
      } catch {
        /* categories optional */
      }
    } catch (error) {
      console.error('Failed to load data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Today · TaskFlow';
    fetchTasks();
  }, []);

  return (
    <TaskListView
      title="Today's Focus"
      subtitle="Tasks due before the day ends"
      tasks={tasks}
      loading={loading}
      onRefresh={fetchTasks}
      categories={categories}
      emptyIcon="bi-calendar-check"
      emptyTitle="Nothing due today"
      emptyDescription="Take it easy, or jump into upcoming work."
    />
  );
};

export default Today;
