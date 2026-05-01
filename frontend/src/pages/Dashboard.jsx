import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setStats(response.data.dashboard);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <h1>Dashboard</h1>

        {error && <div className="alert alert-error">{error}</div>}

        {stats && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>{stats.totalProjects}</h3>
                <p>Projects</p>
              </div>
              <div className="stat-card">
                <h3>{stats.totalTasks}</h3>
                <p>Total Tasks</p>
              </div>
              <div className="stat-card">
                <h3>{stats.myTasks}</h3>
                <p>My Tasks</p>
              </div>
              <div className="stat-card alert-danger">
                <h3>{stats.overdueTasks}</h3>
                <p>Overdue Tasks</p>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="dashboard-section">
                <h2>Task Status Distribution</h2>
                <div className="status-breakdown">
                  <div className="status-item">
                    <span>📝 Todo</span>
                    <span className="count">{stats.statusStats.todo}</span>
                  </div>
                  <div className="status-item">
                    <span>⚙️ In Progress</span>
                    <span className="count">{stats.statusStats.inProgress}</span>
                  </div>
                  <div className="status-item">
                    <span>👀 Review</span>
                    <span className="count">{stats.statusStats.review}</span>
                  </div>
                  <div className="status-item">
                    <span>✅ Done</span>
                    <span className="count">{stats.statusStats.done}</span>
                  </div>
                </div>
              </div>

              <div className="dashboard-section">
                <h2>Priority Distribution</h2>
                <div className="priority-breakdown">
                  <div className="priority-item">
                    <span>🟢 Low</span>
                    <span className="count">{stats.priorityStats.low}</span>
                  </div>
                  <div className="priority-item">
                    <span>🟡 Medium</span>
                    <span className="count">{stats.priorityStats.medium}</span>
                  </div>
                  <div className="priority-item">
                    <span>🟠 High</span>
                    <span className="count">{stats.priorityStats.high}</span>
                  </div>
                  <div className="priority-item">
                    <span>🔴 Critical</span>
                    <span className="count">{stats.priorityStats.critical}</span>
                  </div>
                </div>
              </div>
            </div>

            {stats.overdueTasks.length > 0 && (
              <div className="dashboard-section alert-section">
                <h2>⚠️ Overdue Tasks</h2>
                {stats.overdueTasks.map((task) => (
                  <div key={task._id} className="task-item">
                    <span>{task.title}</span>
                    <span className="due-date">{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Dashboard;
