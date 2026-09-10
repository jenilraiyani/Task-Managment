import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Today from './pages/Today';
import Upcoming from './pages/Upcoming';
import Completed from './pages/Completed';
import Overdue from './pages/Overdue';
import AddTask from './pages/AddTask';
import Layout from './components/Layout/Layout';

const BootLoader = () => (
  <div className="app-boot">
    <div className="app-boot-inner">
      <div className="app-boot-mark">
        <i className="bi bi-check2-square"></i>
      </div>
      <p className="text-muted mb-0" style={{ fontWeight: 600 }}>Loading TaskFlow...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <BootLoader />;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <BootLoader />;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />

        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="today" element={<Today />} />
          <Route path="upcoming" element={<Upcoming />} />
          <Route path="completed" element={<Completed />} />
          <Route path="overdue" element={<Overdue />} />
          <Route path="add-task" element={<AddTask />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
