import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import '../styles/Projects.css';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', startDate: '', endDate: '' });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectAPI.getAll();
      setProjects(response.data.projects);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await projectAPI.create(formData);
      setFormData({ name: '', description: '', startDate: '', endDate: '' });
      setIsModalOpen(false);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectAPI.delete(id);
        fetchProjects();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete project');
      }
    }
  };

  if (loading) return <Spinner />;

  return (
    <>
      <Navbar />
      <div className="projects-container">
        <div className="page-header">
          <h1>Projects</h1>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            + New Project
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project._id} className="project-card">
              <div className="project-header">
                <h3>{project.name}</h3>
                <span className={`status status-${project.status}`}>{project.status}</span>
              </div>
              <p className="project-description">{project.description}</p>
              <div className="project-members">
                {project.members.slice(0, 3).map((member) => (
                  <img
                    key={member.user._id}
                    src={member.user.avatar}
                    alt={member.user.name}
                    title={member.user.name}
                  />
                ))}
                {project.members.length > 3 && <span>+{project.members.length - 3}</span>}
              </div>
              <div className="project-actions">
                <Link to={`/projects/${project._id}`} className="btn btn-small btn-info">
                  View
                </Link>
                <button
                  onClick={() => handleDeleteProject(project._id)}
                  className="btn btn-small btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="empty-state">
            <p>No projects yet. Create one to get started!</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        title="Create New Project"
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleCreateProject}>
          <div className="form-group">
            <label>Project Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Project name"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Project description"
              rows="3"
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            Create Project
          </button>
        </form>
      </Modal>
    </>
  );
};

export default Projects;
