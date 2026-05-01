import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { projectAPI, taskAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import '../styles/ProjectDetail.css';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'Medium', dueDate: '' });
  const [memberForm, setMemberForm] = useState({ email: '' });

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        projectAPI.getById(id),
        taskAPI.getProjectTasks(id),
      ]);
      setProject(projectRes.data.project);
      setTasks(tasksRes.data.tasks);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await taskAPI.create({ ...taskForm, projectId: id });
      setTaskForm({ title: '', description: '', priority: 'Medium', dueDate: '' });
      setIsTaskModalOpen(false);
      fetchProjectData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await projectAPI.addMember(id, memberForm);
      setMemberForm({ email: '' });
      setIsMemberModalOpen(false);
      fetchProjectData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Delete this task?')) {
      try {
        await taskAPI.delete(taskId);
        fetchProjectData();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete task');
      }
    }
  };

  if (loading) return <Spinner />;

  return (
    <>
      <Navbar />
      <div className="project-detail-container">
        {error && <div className="alert alert-error">{error}</div>}

        {project && (
          <>
            <div className="project-info">
              <div>
                <h1>{project.name}</h1>
                <p className="description">{project.description}</p>
                <p className="dates">
                  {project.startDate && `📅 ${new Date(project.startDate).toLocaleDateString()}`}
                  {project.endDate && ` - ${new Date(project.endDate).toLocaleDateString()}`}
                </p>
              </div>
              <div className="project-stats">
                <span className={`status status-${project.status}`}>{project.status}</span>
                <span>{tasks.length} Tasks</span>
                <span>{project.members.length} Members</span>
              </div>
            </div>

            <div className="project-grid">
              <section className="team-section">
                <div className="section-header">
                  <h2>Team Members</h2>
                  <button className="btn btn-small" onClick={() => setIsMemberModalOpen(true)}>
                    + Add Member
                  </button>
                </div>
                <div className="members-list">
                  {project.members.map((member) => (
                    <div key={member.user._id} className="member-card">
                      <img src={member.user.avatar} alt={member.user.name} />
                      <div>
                        <p className="member-name">{member.user.name}</p>
                        <p className="member-role">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="tasks-section">
                <div className="section-header">
                  <h2>Tasks</h2>
                  <button className="btn btn-small" onClick={() => setIsTaskModalOpen(true)}>
                    + New Task
                  </button>
                </div>
                <div className="tasks-list">
                  {tasks.map((task) => (
                    <div key={task._id} className="task-card">
                      <div className="task-header">
                        <h4>{task.title}</h4>
                        <span className={`priority priority-${task.priority}`}>{task.priority}</span>
                      </div>
                      <p className="task-status">{task.status}</p>
                      {task.dueDate && (
                        <p className="task-date">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                      )}
                      {task.assignee && (
                        <p className="task-assignee">👤 {task.assignee.name}</p>
                      )}
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className="btn btn-small btn-danger"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
                {tasks.length === 0 && <p className="empty-message">No tasks yet</p>}
              </section>
            </div>
          </>
        )}
      </div>

      <Modal isOpen={isTaskModalOpen} title="Create New Task" onClose={() => setIsTaskModalOpen(false)}>
        <form onSubmit={handleCreateTask}>
          <div className="form-group">
            <label>Task Title *</label>
            <input
              type="text"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              rows="3"
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Priority</label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>

            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            Create Task
          </button>
        </form>
      </Modal>

      <Modal isOpen={isMemberModalOpen} title="Add Team Member" onClose={() => setIsMemberModalOpen(false)}>
        <form onSubmit={handleAddMember}>
          <div className="form-group">
            <label>Member Email *</label>
            <input
              type="email"
              value={memberForm.email}
              onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
              required
              placeholder="member@example.com"
            />
          </div>
          <p className="form-note">Enter the email of the team member to add</p>
          <button type="submit" className="btn btn-primary">
            Add Member
          </button>
        </form>
      </Modal>
    </>
  );
};

export default ProjectDetail;
