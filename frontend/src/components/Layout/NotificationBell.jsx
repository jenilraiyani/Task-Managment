import { useState, useEffect, useRef, useCallback } from 'react';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../../services/notificationService';

const formatRelativeTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const typeIcon = (type) => {
  switch (type) {
    case 'Overdue':
      return 'bi-exclamation-triangle-fill';
    case 'DueToday':
      return 'bi-calendar-event';
    case 'Info':
      return 'bi-plus-circle-fill';
    case 'Reminder':
    default:
      return 'bi-bell-fill';
  }
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await getNotifications();
      setItems(res.data || []);
    } catch (error) {
      console.error('Failed to load notifications', error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 30000);
    return () => clearInterval(timer);
  }, [fetchNotifications]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const unreadCount = items.filter((n) => !n.IsRead).length;

  const handleOpen = async () => {
    setOpen((v) => !v);
    if (!open) {
      setLoading(true);
      await fetchNotifications();
      setLoading(false);
    }
  };

  const handleReadOne = async (id) => {
    try {
      await markNotificationRead(id);
      setItems((prev) =>
        prev.map((n) => (n.Id === id ? { ...n, IsRead: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark notification read', error);
    }
  };

  const handleReadAll = async () => {
    try {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, IsRead: true })));
    } catch (error) {
      console.error('Failed to mark all read', error);
    }
  };

  return (
    <div className="notification-wrap" ref={panelRef}>
      <button
        type="button"
        className="notification-bell"
        onClick={handleOpen}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <i className="bi bi-bell"></i>
        {unreadCount > 0 && (
          <span className="badge-notification">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-panel">
          <div className="notification-panel-header">
            <div>
              <strong>Messages</strong>
              <span className="notification-panel-sub">
                {unreadCount} unread
              </span>
            </div>
            {unreadCount > 0 && (
              <button type="button" className="notification-mark-all" onClick={handleReadAll}>
                Mark all read
              </button>
            )}
          </div>

          <div className="notification-panel-body">
            {loading ? (
              <div className="notification-empty">Loading...</div>
            ) : items.length === 0 ? (
              <div className="notification-empty">
                <i className="bi bi-inbox"></i>
                <p>No messages yet</p>
                <span>Task reminders will show up here.</span>
              </div>
            ) : (
              items.map((item) => (
                <button
                  key={item.Id}
                  type="button"
                  className={`notification-item ${item.IsRead ? 'read' : 'unread'}`}
                  onClick={() => !item.IsRead && handleReadOne(item.Id)}
                >
                  <div className={`notification-item-icon type-${(item.Type || 'Reminder').toLowerCase()}`}>
                    <i className={`bi ${typeIcon(item.Type)}`}></i>
                  </div>
                  <div className="notification-item-content">
                    <div className="notification-item-top">
                      <strong>{item.Title}</strong>
                      <span>{formatRelativeTime(item.CreatedAt)}</span>
                    </div>
                    <p>{item.Message}</p>
                  </div>
                  {!item.IsRead && <span className="notification-dot" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
