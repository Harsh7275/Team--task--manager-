import React, { useState, useEffect } from 'react';
import { projectAPI, taskAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';
import '../styles/Tasks.css';

const Tasks = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [selectedProject, selectedStatus, tasks]);

  const fetchData = async () => {
    try {
      const projectRes = await projectAPI.getAll();
      setProjects(projectRes.data.projects);
      
      // Fetch all tasks
      let allTasks = [];
      for (const project of projectRes.data.projects) {
        const taskRes = await taskAPI.getProjectTasks(project._id);
        allTasks = [...allTasks, ...taskRes.data.tasks];
      }
      setTasks(allTasks);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = tasks;

    if (selectedProject !== 'all') {
      filtered = filtered.filter((task) => task.project._id === selectedProject);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter((task) => task.status === selectedStatus);
    }

    setTasks(filtered);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskAPI.update(taskId, { status: newStatus });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task');
    }
  };

  if (loading) return <Spinner />;

  return (
    <>
      <Navbar />
      <div className="tasks-container">
        <h1>Tasks</h1>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="filters">
          <div className="filter-group">
            <label>Filter by Project:</label>
            <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}>
              <option value="all">All Projects</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Filter by Status:</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="Todo">📝 Todo</option>
              <option value="In Progress">⚙️ In Progress</option>
              <option value="Review">👀 Review</option>
              <option value="Done">✅ Done</option>
            </select>
          </div>
        </div>

        <div className="tasks-board">
          {['Todo', 'In Progress', 'Review', 'Done'].map((status) => (
            <div key={status} className="task-column">
              <h3 className={`column-title status-${status.replace(' ', '')}`}>{status}</h3>
              <div className="tasks-in-column">
                {tasks
                  .filter((task) => task.status === status)
                  .map((task) => (
                    <div key={task._id} className="task-item">
                      <h4>{task.title}</h4>
                      <p className="task-project">{task.project.name}</p>
                      <p className="task-description">{task.description}</p>
                      <div className="task-meta">
                        <span className={`priority priority-${task.priority}`}>{task.priority}</span>
                        {task.dueDate && (
                          <span className="task-due">
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {task.assignee && (
                        <p className="task-assignee">👤 {task.assignee.name}</p>
                      )}
                      <div className="task-actions">
                        {status !== 'Done' && (
                          <button
                            className="btn btn-small btn-info"
                            onClick={() => {
                              const statuses = ['Todo', 'In Progress', 'Review', 'Done'];
                              const currentIndex = statuses.indexOf(status);
                              if (currentIndex < statuses.length - 1) {
                                handleStatusChange(task._id, statuses[currentIndex + 1]);
                              }
                            }}
                          >
                            Move →
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Tasks;
