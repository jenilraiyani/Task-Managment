import { useState, useEffect } from 'react';
import { getTasks, getCategories } from '../services/taskService';
import TaskListView from '../components/Tasks/TaskListView';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await getTasks();
      setTasks(res.data || []);
      const catRes = await getCategories();
      setCategories(catRes.data || []);
    } catch (error) {
      console.error('Failed to load data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'All Tasks · TaskFlow';
    fetchTasks();
  }, []);

  return (
    <TaskListView
      title="All Tasks"
      subtitle={`${tasks.length} task${tasks.length === 1 ? '' : 's'} in your workspace`}
      tasks={tasks}
      loading={loading}
      onRefresh={fetchTasks}
      categories={categories}
      showAdd
      showFilters
      emptyIcon="bi-check2-all"
      emptyTitle="No tasks yet"
      emptyDescription="You are all caught up. Add a task when you are ready."
    />
  );
};

export default Tasks;
