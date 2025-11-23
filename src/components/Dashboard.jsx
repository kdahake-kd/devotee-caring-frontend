import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { activityService } from '../services/activityService';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DailyActivityForm from './DailyActivityForm';
import WeekView from './WeekView';
import FilterActivities from './FilterActivities';
import MonthlyActivities from './MonthlyActivities';
import { FloatingMessages } from './SpiritualAnimations';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [weekData, setWeekData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('week'); // 'week', 'filter', or 'monthly'
  const [totalChantingRounds, setTotalChantingRounds] = useState(0);

  useEffect(() => {
    // Check if tab parameter is in URL
    const tabParam = searchParams.get('tab');
    if (tabParam === 'monthly') {
      setActiveTab('monthly');
    }
    fetchWeekData();
    fetchChantingRoundCount();
  }, [searchParams]);

  useEffect(() => {
    // Refresh chanting count when activities are updated
    if (!loading) {
      fetchChantingRoundCount();
    }
  }, [weekData]);

  const fetchWeekData = async () => {
    try {
      setLoading(true);
      const data = await activityService.getWeekData();
      setWeekData(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load week data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    logout();
    navigate('/login');
  };

  const handleActivityUpdate = () => {
    fetchWeekData();
    fetchChantingRoundCount();
  };

  const fetchChantingRoundCount = async () => {
    try {
      const data = await activityService.getChantingRoundCount();
      setTotalChantingRounds(data.total_chanting_rounds || 0);
    } catch (err) {
      console.error('Failed to fetch chanting round count:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <FloatingMessages />
      
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Devotee Caring System</h1>
          <div className="header-right-section">
            <div className="chanting-counter">
              <div className="counter-icon">
                <img src="/images/iskcon-logo.png" alt="ISKCON Logo" className="counter-logo" />
              </div>
              <div className="counter-content">
                <span className="counter-label">Total Chanting Rounds</span>
                <span className="counter-value">{totalChantingRounds.toLocaleString()}</span>
              </div>
            </div>
            <div className="user-info">
              <span className="welcome-text">Welcome, {user?.first_name} {user?.last_name}</span>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
              <button 
                onClick={() => navigate('/profile')} 
                className="btn-profile"
                title="Profile Settings"
              >
                {user?.profile_image ? (
                  <img 
                    src={user.profile_image} 
                    alt="Profile" 
                    className="profile-image-icon"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const emoji = e.target.nextElementSibling;
                      if (emoji) emoji.style.display = 'block';
                    }}
                  />
                ) : null}
                {!user?.profile_image && (
                  <span className="profile-icon-emoji">👤</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="dashboard-tabs">
        <button
          className={`tab ${activeTab === 'week' ? 'active' : ''}`}
          onClick={() => setActiveTab('week')}
        >
          Current Week
        </button>
        <button
          className={`tab ${activeTab === 'filter' ? 'active' : ''}`}
          onClick={() => setActiveTab('filter')}
        >
          Filter Activities
        </button>
        <button
          className={`tab ${activeTab === 'monthly' ? 'active' : ''}`}
          onClick={() => setActiveTab('monthly')}
        >
          Monthly Activities
        </button>
      </div>

      <main className="dashboard-content">
        {error && <div className="error-message">{error}</div>}

        {activeTab === 'week' && weekData && (
          <WeekView
            weekData={weekData}
            onActivityUpdate={handleActivityUpdate}
          />
        )}

        {activeTab === 'filter' && (
          <FilterActivities />
        )}

        {activeTab === 'monthly' && (
          <MonthlyActivities />
        )}
      </main>
    </div>
  );
};

export default Dashboard;

