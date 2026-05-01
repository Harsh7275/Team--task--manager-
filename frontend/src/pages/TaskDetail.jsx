import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { taskAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';
import '../styles/TaskDetail.css';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      const response = await taskAPI.getById(id);
      setTask(response.data.task);
      setFormData({
        title: response.data.task.title,
        description: response.data.task.description,
        status: response.data.task.status,
        priority: response.data.task.priority,
        dueDate: response.data.task.dueDate,
        estimatedHours: response.data.task.estimatedHours,
        actualHours: response.data.task.actualHours,
      });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      await taskAPI.update(id, formData);
      setIsEditing(false);
      fetchTask();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    try {
      await taskAPI.addComment(id, { text: comment });
      setComment('');
      fetchTask();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add comment');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this task?')) {
      try {
        await taskAPI.delete(id);
        navigate(-1);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete task');
      }
    }
  };

  if (loading) return <Spinner />;

  return (
    <>
      <Navbar />
      <div className="task-detail-container">
        {error && <div className="alert alert-error">{error}</div>}

        {task && (
          <>
            <button className="btn btn-back" onClick={() => navigate(-1)}>
              ← Back
            </button>

            <div className="task-detail-content">
              {isEditing ? (
                <form onSubmit={handleUpdateTask} className="edit-form">
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows="4"
                    ></textarea>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option>Todo</option>
                        <option>In Progress</option>
                        <option>Review</option>
                        <option>Done</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Priority</label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      >
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                        <option>Critical</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Due Date</label>
                      <input
                        type="date"
                        value={formData.dueDate || ''}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Estimated Hours</label>
                      <input
                        type="number"
                        value={formData.estimatedHours || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, estimatedHours: parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                      Save Changes
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="task-header">
                    <div>
                      <h1>{task.title}</h1>
                      <p className="task-id">ID: {task._id}</p>
                    </div>
                    <div className="header-actions">
                      <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                        Edit
                      </button>
                      <button className="btn btn-danger" onClick={handleDelete}>
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="task-meta-section">
                    <div className="meta-item">
                      <span className="label">Status</span>
                      <span className={`status-badge status-${task.status.replace(' ', '')}`}>
                        {task.status}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="label">Priority</span>
                      <span className={`priority-badge priority-${task.priority}`}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="label">Due Date</span>
                      <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="meta-item">
                      <span className="label">Assigned To</span>
                      <span>{task.assignee ? task.assignee.name : 'Unassigned'}</span>
                    </div>
                  </div>

                  <div className="task-description">
                    <h3>Description</h3>
                    <p>{task.description || 'No description provided'}</p>
                  </div>

                  <div className="task-hours">
                    <div>
                      <h4>Estimated Hours: {task.estimatedHours || 0}</h4>
                    </div>
                    <div>
                      <h4>Actual Hours: {task.actualHours || 0}</h4>
                    </div>
                  </div>

                  <div className="comments-section">
                    <h3>Comments ({task.comments.length})</h3>

                    <form onSubmit={handleAddComment} className="comment-form">
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add a comment..."
                        rows="2"
                      ></textarea>
                      <button type="submit" className="btn btn-primary">
                        Post Comment
                      </button>
                    </form>

                    <div className="comments-list">
                      {task.comments.map((cmt) => (
                        <div key={cmt._id || cmt.createdAt} className="comment-item">
                          <img src={cmt.user.avatar} alt={cmt.user.name} />
                          <div className="comment-content">
                            <p className="comment-author">{cmt.user.name}</p>
                            <p className="comment-text">{cmt.text}</p>
                            <p className="comment-date">
                              {new Date(cmt.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default TaskDetail;
