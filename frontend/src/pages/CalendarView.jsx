import { useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { getTasks, updateTask, getCategories } from '../services/taskService';
import LoadingState from '../components/UI/LoadingState';
import TaskModal from '../components/Tasks/TaskModal';
import '../styles/calendar.css'; // Custom styles for the calendar

const CalendarView = () => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // For editing a task via modal when clicked
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await getTasks();
      setTasks(res.data || []);
      try {
        const catRes = await getCategories();
        setCategories(catRes.data || []);
      } catch {
        // Optional
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'Calendar · Taskora';
    fetchTasks();
  }, [fetchTasks]);

  // Transform Tasks into FullCalendar Events
  const events = tasks
    .filter(task => task.Deadline) // Only show tasks with a deadline
    .map(task => {
      let bgColor = 'var(--primary-color)';
      if (task.Priority === 'High') bgColor = 'var(--danger)';
      if (task.Priority === 'Medium') bgColor = 'var(--warning)';
      if (task.Priority === 'Low') bgColor = 'var(--success)';
      
      // If completed, dull the color
      if (task.Status === 'Completed') bgColor = 'var(--text-muted)';

      return {
        id: task._id,
        title: task.Title,
        start: task.Deadline,
        backgroundColor: bgColor,
        borderColor: bgColor,
        extendedProps: {
          task,
        },
      };
    });

  const handleEventDrop = async (info) => {
    const taskId = info.event.id;
    const newDate = info.event.start;
    
    // Update local state optimistically
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, Deadline: newDate.toISOString() } : t));

    try {
      await updateTask(taskId, { deadline: newDate.toISOString() });
    } catch (error) {
      console.error('Failed to update task date:', error);
      info.revert(); // Revert the visual drag if the API fails
    }
  };

  const handleEventClick = (info) => {
    const task = info.event.extendedProps.task;
    setSelectedTask(task);
    setShowModal(true);
  };

  if (loading) return <LoadingState label="Loading your calendar..." />;

  return (
    <div className="calendar-page">
      <div className="d-flex justify-content-end mb-3">
        <button 
          className="btn btn-primary" 
          onClick={() => { setSelectedTask(null); setShowModal(true); }}
        >
          <i className="bi bi-plus-lg me-2"></i>New Task
        </button>
      </div>

      <div className="card calendar-card">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events}
          editable={true} // Enables drag and drop
          droppable={true}
          eventDrop={handleEventDrop}
          eventClick={handleEventClick}
          height="auto"
          dayMaxEvents={true}
        />
      </div>

      <TaskModal
        show={showModal}
        handleClose={() => { setShowModal(false); setSelectedTask(null); }}
        task={selectedTask}
        onTaskSaved={fetchTasks}
        categories={categories}
      />
    </div>
  );
};

export default CalendarView;
