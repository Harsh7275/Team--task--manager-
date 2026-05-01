import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { authAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import '../styles/Profile.css';

const ProfilePage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setError('');
    setIsDeleting(true);

    try {
      const response = await authAPI.deleteAccount(deletePassword);
      setIsDeleteModalOpen(false);
      setDeletePassword('');
      setSuccess(`${response.data.message}. Redirecting...`);
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="profile-container">
        <div className="profile-content">
          <h1>Profile Settings</h1>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="profile-card">
            <div className="profile-header">
              <img src={user?.avatar} alt={user?.name} className="profile-avatar" />
              <div className="profile-info">
                <h2>{user?.name}</h2>
                <p className="email">{user?.email}</p>
                <p className="country">📍 {user?.country}</p>
              </div>
            </div>

            <div className="profile-section">
              <h3>Account Information</h3>
              <div className="info-item">
                <label>Name</label>
                <p>{user?.name}</p>
              </div>
              <div className="info-item">
                <label>Email</label>
                <p>{user?.email}</p>
              </div>
              <div className="info-item">
                <label>Country</label>
                <p>{user?.country}</p>
              </div>
            </div>

            <div className="profile-section danger-section">
              <h3>⚠️ Danger Zone</h3>
              <p className="danger-description">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button
                className="btn btn-danger btn-large"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                Delete Account Permanently
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        title="Delete Account Permanently"
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletePassword('');
          setError('');
        }}
      >
        <div className="delete-warning">
          <p className="warning-text">
            ⚠️ <strong>Warning:</strong> This action cannot be undone. You will lose all your data including:
          </p>
          <ul className="warning-list">
            <li>Your account and profile</li>
            <li>All projects you created</li>
            <li>All tasks and comments</li>
            <li>Team memberships</li>
          </ul>
          <p className="warning-text">
            To confirm deletion, please enter your password:
          </p>

          <form onSubmit={handleDeleteAccount}>
            <div className="form-group">
              <label>Confirm your password</label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                required
                placeholder="Enter your password"
                disabled={isDeleting}
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletePassword('');
                  setError('');
                }}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-danger"
                disabled={isDeleting || !deletePassword}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default ProfilePage;
