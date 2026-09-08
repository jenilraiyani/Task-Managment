import { useState, useEffect } from 'react';
import { getTasks, getCategories } from '../services/taskService';
import TaskListView from '../components/Tasks/TaskListView';

const Completed = () => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await getTasks();
      setTasks((res.data || []).filter((t) => t.Status === 'Completed'));
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
    document.title = 'Completed · TaskFlow';
    fetchTasks();
  }, []);

  return (
    <TaskListView
      title="Completed"
      subtitle="Finished work, ready for the archive"
      tasks={tasks}
      loading={loading}
      onRefresh={fetchTasks}
      categories={categories}
      emptyIcon="bi-check-circle"
      emptyTitle="No completed tasks yet"
      emptyDescription="Finish a task and it will show up here."
    />
  );
};

export default Completed;
