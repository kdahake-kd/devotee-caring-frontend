import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import SpiritualGrowth from './SpiritualGrowth';
import QRCodeGenerator from './QRCodeGenerator';
import './Profile.css';

const Profile = () => {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('update-profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile update state
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    profile_image: null,
    date_of_birth: '',
    initiation_date: '',
  });
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_new_password: '',
  });

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSadanaDeleteConfirm, setShowSadanaDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await authService.getProfile();
      setProfileData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        profile_image: null,
        date_of_birth: data.date_of_birth || '',
        initiation_date: data.initiation_date || '',
      });
      if (data.profile_image_url) {
        setProfileImagePreview(data.profile_image_url);
      } else if (data.profile_image) {
        const imageUrl = data.profile_image.startsWith('http') 
          ? data.profile_image 
          : `http://localhost:8000${data.profile_image}`;
        setProfileImagePreview(imageUrl);
      } else {
        setProfileImagePreview(null);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileData({ ...profileData, profile_image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const updateData = { ...profileData };
      const response = await authService.updateProfile(updateData);
      
      // Update user context with new data
      if (response.user) {
        const updatedUser = {
          ...user,
          ...response.user
        };
        login(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      if (passwordData.new_password !== passwordData.confirm_new_password) {
        setError('New passwords do not match');
        return;
      }
      
      await authService.changePassword(
        passwordData.old_password,
        passwordData.new_password,
        passwordData.confirm_new_password
      );
      
      setSuccess('Password changed successfully!');
      setPasswordData({
        old_password: '',
        new_password: '',
        confirm_new_password: '',
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async () => {
    try {
      setLoading(true);
      await authService.deleteProfile();
      await authService.logout();
      logout();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete profile');
      setLoading(false);
    }
  };

  const handleDeleteSadanaData = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await authService.deleteSadanaData();
      
      setSuccess('All sadana information deleted successfully. Your account remains active.');
      setShowSadanaDeleteConfirm(false);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete sadana data');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profileData.first_name) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profile Settings</h1>
        <button onClick={() => navigate('/dashboard')} className="btn-back">
          ← Back to Dashboard
        </button>
      </div>

      <div className="profile-sections">
        <div className="profile-sidebar">
          <button
            className={`section-btn ${activeSection === 'update-profile' ? 'active' : ''}`}
            onClick={() => setActiveSection('update-profile')}
          >
            Update Profile
          </button>
          <button
            className={`section-btn ${activeSection === 'spiritual-growth' ? 'active' : ''}`}
            onClick={() => setActiveSection('spiritual-growth')}
          >
            My Spiritual Growth
          </button>
          <button
            className={`section-btn ${activeSection === 'qr-code' ? 'active' : ''}`}
            onClick={() => setActiveSection('qr-code')}
          >
            QR Code Entry
          </button>
          <button
            className={`section-btn ${activeSection === 'change-password' ? 'active' : ''}`}
            onClick={() => setActiveSection('change-password')}
          >
            Change Password
          </button>
          <button
            className={`section-btn ${activeSection === 'delete-profile' ? 'active' : ''}`}
            onClick={() => setActiveSection('delete-profile')}
          >
            Remove Profile
          </button>
        </div>

        <div className="profile-content">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {activeSection === 'update-profile' && (
            <div className="profile-section">
              <h2>Update Profile</h2>
              <form onSubmit={handleProfileUpdate} className="profile-form">
                <div className="profile-image-section">
                  <div className="profile-image-preview">
                    {profileImagePreview ? (
                      <img src={profileImagePreview} alt="Profile" />
                    ) : (
                      <div className="profile-image-placeholder">
                        <span>👤</span>
                      </div>
                    )}
                  </div>
                  <label htmlFor="profile_image" className="file-input-label">
                    Choose Profile Image
                    <input
                      type="file"
                      id="profile_image"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="file-input"
                    />
                  </label>
                </div>

                <div className="form-group">
                  <label htmlFor="first_name">First Name</label>
                  <input
                    type="text"
                    id="first_name"
                    value={profileData.first_name}
                    onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="last_name">Last Name</label>
                  <input
                    type="text"
                    id="last_name"
                    value={profileData.last_name}
                    onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="date_of_birth">Date of Birth</label>
                  <input
                    type="date"
                    id="date_of_birth"
                    value={profileData.date_of_birth}
                    onChange={(e) => setProfileData({ ...profileData, date_of_birth: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="initiation_date">Initiation Date</label>
                  <input
                    type="date"
                    id="initiation_date"
                    value={profileData.initiation_date}
                    onChange={(e) => setProfileData({ ...profileData, initiation_date: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>
          )}

          {activeSection === 'spiritual-growth' && (
            <div className="profile-section spiritual-growth-section">
              <SpiritualGrowth />
            </div>
          )}

          {activeSection === 'qr-code' && (
            <div className="profile-section qr-code-section">
              <QRCodeGenerator />
            </div>
          )}

          {activeSection === 'change-password' && (
            <div className="profile-section">
              <h2>Change Password</h2>
              <form onSubmit={handlePasswordChange} className="profile-form">
                <div className="form-group">
                  <label htmlFor="old_password">Old Password</label>
                  <input
                    type="password"
                    id="old_password"
                    value={passwordData.old_password}
                    onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="new_password">New Password</label>
                  <input
                    type="password"
                    id="new_password"
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirm_new_password">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirm_new_password"
                    value={passwordData.confirm_new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm_new_password: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

          {activeSection === 'delete-profile' && (
            <div className="profile-section">
              <h2>Remove Profile</h2>
              <div className="delete-section">
                <div className="delete-option">
                  <h3>Delete Complete Profile</h3>
                  <p>This will permanently delete your account and all associated data, including:</p>
                  <ul>
                    <li>Your profile information</li>
                    <li>All daily activities</li>
                    <li>All monthly activities</li>
                    <li>All week data</li>
                  </ul>
                  <button
                    className="btn-delete"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={loading}
                  >
                    Delete Complete Profile
                  </button>
                </div>

                <div className="delete-option">
                  <h3>Remove Sadana Information</h3>
                  <p>This will delete only your sadana data (activities), but keep your account:</p>
                  <ul>
                    <li>All daily activities will be deleted</li>
                    <li>All monthly activities will be deleted</li>
                    <li>All week data will be deleted</li>
                    <li>Your account will remain active</li>
                  </ul>
                  <button
                    className="btn-delete-secondary"
                    onClick={() => setShowSadanaDeleteConfirm(true)}
                    disabled={loading}
                  >
                    Remove Sadana Information
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Profile Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Delete Profile</h3>
            <p className="warning-text">
              ⚠️ Are you sure you want to delete your complete profile?
            </p>
            <p className="warning-details">
              This action cannot be undone. All your data will be permanently removed, including:
            </p>
            <ul className="warning-list">
              <li>Your profile information</li>
              <li>All your sadana details</li>
              <li>All daily activities</li>
              <li>All monthly activities</li>
              <li>All week data</li>
            </ul>
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="btn-confirm-delete"
                onClick={handleDeleteProfile}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Sadana Data Confirmation Modal */}
      {showSadanaDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Remove Sadana Information</h3>
            <p className="warning-text">
              ⚠️ Are you sure you want to delete all your sadana information?
            </p>
            <p className="warning-details">
              This will delete all your activity data, but your account will remain active:
            </p>
            <ul className="warning-list">
              <li>All daily activities will be deleted</li>
              <li>All monthly activities will be deleted</li>
              <li>All week data will be deleted</li>
              <li>Your account profile will remain</li>
            </ul>
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowSadanaDeleteConfirm(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="btn-confirm-delete-secondary"
                onClick={handleDeleteSadanaData}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

