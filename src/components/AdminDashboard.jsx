import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminService';
import { authService } from '../services/authService';
import { format } from 'date-fns';
import Analytics from './Analytics';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [devotees, setDevotees] = useState([]);
  const [selectedDevotee, setSelectedDevotee] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState('');
  const [detailError, setDetailError] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  
  // Filter states for devotee detail
  const [filterType, setFilterType] = useState('all'); // 'all', 'range', 'week', 'month', 'year'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterWeek, setFilterWeek] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filteredActivities, setFilteredActivities] = useState(null);
  const [filtering, setFiltering] = useState(false);
  const [activeTab, setActiveTab] = useState('devotees'); // 'devotees' or 'analytics'

  useEffect(() => {
    fetchDevotees();
  }, [searchQuery]);

  const fetchDevotees = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminService.getAllDevotees(searchQuery);
      setDevotees(data.devotees || []);
      setTotalCount(data.total_count || 0);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load devotees');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDevoteeClick = async (devoteeId) => {
    try {
      setDetailError('');
      setLoadingDetail(true);
      setSelectedDevotee(null); // Clear previous data
      const data = await adminService.getDevoteeDetail(devoteeId);
      setSelectedDevotee(data);
    } catch (err) {
      console.error('Error loading devotee details:', err);
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.detail || 
                          err.message || 
                          'Failed to load devotee details';
      setDetailError(errorMessage);
      console.error('Full error response:', err.response);
      // Still show modal with error
      setSelectedDevotee({ id: devoteeId, error: true });
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    logout();
    navigate('/admin/login');
  };

  const handleCloseDetail = () => {
    setSelectedDevotee(null);
    setFilteredActivities(null);
    setFilterType('all');
    setStartDate('');
    setEndDate('');
    setFilterWeek('');
    setFilterMonth('');
    setFilterYear('');
  };

  const handleFilterActivities = async () => {
    if (!selectedDevotee || !selectedDevotee.id) return;
    
    setFiltering(true);
    setDetailError('');
    
    try {
      const filters = {};
      
      if (filterType === 'range') {
        if (!startDate || !endDate) {
          setDetailError('Please select both start and end dates');
          setFiltering(false);
          return;
        }
        filters.start_date = startDate;
        filters.end_date = endDate;
      } else if (filterType === 'week') {
        if (!filterWeek) {
          setDetailError('Please select a week');
          setFiltering(false);
          return;
        }
        filters.week_id = filterWeek;
      } else if (filterType === 'month') {
        if (!filterMonth) {
          setDetailError('Please select a month');
          setFiltering(false);
          return;
        }
        filters.month = filterMonth;
      } else if (filterType === 'year') {
        if (!filterYear) {
          setDetailError('Please select a year');
          setFiltering(false);
          return;
        }
        filters.year = filterYear;
      }
      
      const data = await adminService.filterDevoteeActivities(selectedDevotee.id, filters);
      setFilteredActivities(data);
    } catch (err) {
      setDetailError(err.response?.data?.error || 'Failed to filter activities');
    } finally {
      setFiltering(false);
    }
  };

  const handleClearFilter = () => {
    setFilteredActivities(null);
    setFilterType('all');
    setStartDate('');
    setEndDate('');
    setFilterWeek('');
    setFilterMonth('');
    setFilterYear('');
  };

  // Get activities to display (filtered or original)
  const getDisplayActivities = () => {
    if (filteredActivities) {
      return {
        daily: filteredActivities.daily_activities || [],
        monthly: filteredActivities.monthly_activities || []
      };
    }
    return {
      daily: selectedDevotee?.daily_activities || [],
      monthly: selectedDevotee?.monthly_activities || []
    };
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-content">
          <div>
            <h1>👑 Admin Dashboard</h1>
            <p>Devotee Caring System</p>
          </div>
          <div className="admin-user-info">
            <button 
              onClick={() => navigate('/')} 
              className="btn-home"
              title="Home Page"
            >
              Home
            </button>
            <span>Welcome, {user?.first_name} {user?.last_name}</span>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'devotees' ? 'active' : ''}`}
            onClick={() => setActiveTab('devotees')}
          >
            👥 Devotees
          </button>
          <button
            className={`admin-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📊 Analytics
          </button>
        </div>

        {activeTab === 'analytics' ? (
          <Analytics />
        ) : (
          <>
        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>Total Devotees</h3>
              <p className="stat-number">{totalCount}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔍</div>
            <div className="stat-info">
              <h3>Search Results</h3>
              <p className="stat-number">{devotees.length}</p>
            </div>
          </div>
        </div>

        <div className="admin-content">
          <div className="search-section">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by name, mobile number, or email..."
                value={searchQuery}
                onChange={handleSearch}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading">Loading devotees...</div>
          ) : (
            <div className="devotees-table-container">
              <table className="devotees-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Mobile Number</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Daily Activities</th>
                    <th>Monthly Activities</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {devotees.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="no-data">
                        {searchQuery ? 'No devotees found matching your search.' : 'No devotees found.'}
                      </td>
                    </tr>
                  ) : (
                    devotees.map((devotee) => (
                      <tr key={devotee.id}>
                        <td>
                          <strong>{devotee.full_name}</strong>
                        </td>
                        <td>{devotee.username}</td>
                        <td>{devotee.email || 'N/A'}</td>
                        <td>
                          <span className={`status-badge ${devotee.is_active ? 'active' : 'inactive'}`}>
                            {devotee.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>{devotee.total_daily_activities}</td>
                        <td>{devotee.total_monthly_activities}</td>
                        <td>{format(new Date(devotee.created_at), 'MMM dd, yyyy')}</td>
                        <td>
                          <button
                            className="btn-view"
                            onClick={() => handleDevoteeClick(devotee.id)}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
          </>
        )}
      </main>

      {/* Devotee Detail Modal */}
      {selectedDevotee !== null && (
        <div className="modal-overlay" onClick={handleCloseDetail}>
          <div className="modal-content devotee-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedDevotee.full_name || 'Devotee'} Details</h2>
              <button className="close-btn" onClick={handleCloseDetail}>×</button>
            </div>

            {detailError && (
              <div className="error-message" style={{ margin: '20px 25px' }}>
                {detailError}
              </div>
            )}

            {loadingDetail && (
              <div className="loading" style={{ padding: '40px', textAlign: 'center' }}>
                Loading devotee details...
              </div>
            )}

            {!loadingDetail && selectedDevotee && !selectedDevotee.error && selectedDevotee.full_name && (
            <div className="devotee-detail-content">
              {/* Filter Section */}
              <div className="detail-section filter-section">
                <h3>Filter Activities</h3>
                <div className="filter-controls">
                  <div className="filter-type-selector">
                    <label className={filterType === 'all' ? 'active' : ''}>
                      <input
                        type="radio"
                        name="filterType"
                        value="all"
                        checked={filterType === 'all'}
                        onChange={(e) => {
                          setFilterType(e.target.value);
                          handleClearFilter();
                        }}
                      />
                      <span>All Activities</span>
                    </label>
                    <label className={filterType === 'range' ? 'active' : ''}>
                      <input
                        type="radio"
                        name="filterType"
                        value="range"
                        checked={filterType === 'range'}
                        onChange={(e) => setFilterType(e.target.value)}
                      />
                      <span>Date Range</span>
                    </label>
                    <label className={filterType === 'week' ? 'active' : ''}>
                      <input
                        type="radio"
                        name="filterType"
                        value="week"
                        checked={filterType === 'week'}
                        onChange={(e) => setFilterType(e.target.value)}
                      />
                      <span>By Week</span>
                    </label>
                    <label className={filterType === 'month' ? 'active' : ''}>
                      <input
                        type="radio"
                        name="filterType"
                        value="month"
                        checked={filterType === 'month'}
                        onChange={(e) => setFilterType(e.target.value)}
                      />
                      <span>By Month</span>
                    </label>
                    <label className={filterType === 'year' ? 'active' : ''}>
                      <input
                        type="radio"
                        name="filterType"
                        value="year"
                        checked={filterType === 'year'}
                        onChange={(e) => setFilterType(e.target.value)}
                      />
                      <span>By Year</span>
                    </label>
                  </div>

                  {filterType === 'range' && (
                    <div className="filter-inputs">
                      <div className="filter-input-group">
                        <label>Start Date:</label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </div>
                      <div className="filter-input-group">
                        <label>End Date:</label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {filterType === 'week' && (
                    <div className="filter-inputs">
                      <div className="filter-input-group">
                        <label>Week ID:</label>
                        <input
                          type="number"
                          placeholder="Enter week ID"
                          value={filterWeek}
                          onChange={(e) => setFilterWeek(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {filterType === 'month' && (
                    <div className="filter-inputs">
                      <div className="filter-input-group">
                        <label>Month:</label>
                        <select
                          value={filterMonth}
                          onChange={(e) => setFilterMonth(e.target.value)}
                        >
                          <option value="">Select Month</option>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                            <option key={m} value={m}>
                              {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {filterType === 'year' && (
                    <div className="filter-inputs">
                      <div className="filter-input-group">
                        <label>Year:</label>
                        <input
                          type="number"
                          placeholder="Enter year (e.g., 2025)"
                          value={filterYear}
                          onChange={(e) => setFilterYear(e.target.value)}
                          min="2020"
                          max="2100"
                        />
                      </div>
                    </div>
                  )}

                  {filterType !== 'all' && (
                    <div className="filter-actions">
                      <button
                        className="btn-filter"
                        onClick={handleFilterActivities}
                        disabled={filtering}
                      >
                        {filtering ? 'Filtering...' : 'Apply Filter'}
                      </button>
                      <button
                        className="btn-clear-filter"
                        onClick={handleClearFilter}
                        disabled={filtering}
                      >
                        Clear Filter
                      </button>
                    </div>
                  )}

                  {filteredActivities && (
                    <div className="filter-results-info">
                      <p>
                        Showing {filteredActivities.total_daily || 0} daily activities and{' '}
                        {filteredActivities.total_monthly || 0} monthly activities
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <h3>Personal Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Name:</span>
                    <span className="value">{selectedDevotee.full_name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Mobile:</span>
                    <span className="value">{selectedDevotee.username}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Email:</span>
                    <span className="value">{selectedDevotee.email || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Status:</span>
                    <span className={`status-badge ${selectedDevotee.is_active ? 'active' : 'inactive'}`}>
                      {selectedDevotee.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Verified:</span>
                    <span className={`status-badge ${selectedDevotee.is_user_verified ? 'active' : 'inactive'}`}>
                      {selectedDevotee.is_user_verified ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Joined:</span>
                    <span className="value">{format(new Date(selectedDevotee.created_at), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Daily Activities ({getDisplayActivities().daily.length})</h3>
                <div className="activities-list">
                  {getDisplayActivities().daily.length > 0 ? (
                    <div className="activities-table-scroll">
                      <table className="activities-mini-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Hearing</th>
                            <th>Reading</th>
                            <th>Chanting</th>
                            <th>Sport Session</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getDisplayActivities().daily.map((activity) => (
                            <tr key={activity.id}>
                              <td>{format(new Date(activity.date), 'MMM dd, yyyy')}</td>
                              <td>{activity.daily_hearing}</td>
                              <td>{activity.daily_reading}</td>
                              <td>{activity.daily_chanting} rounds</td>
                              <td>{activity.sport_session_attendance || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="no-data-text">No daily activities found.</p>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <h3>Monthly Activities ({getDisplayActivities().monthly.length})</h3>
                <div className="activities-list">
                  {getDisplayActivities().monthly.length > 0 ? (
                    <div className="activities-table-scroll">
                      <table className="activities-mini-table">
                        <thead>
                          <tr>
                            <th>Month</th>
                            <th>Year</th>
                            <th>Morning Program</th>
                            <th>Book Completed</th>
                            <th>Book Name</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getDisplayActivities().monthly.map((activity) => (
                            <tr key={activity.id}>
                              <td>{activity.month}</td>
                              <td>{activity.year}</td>
                              <td>{activity.monthly_morning_program}</td>
                              <td>{activity.monthly_book_completed}</td>
                              <td>{activity.book_name || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="no-data-text">No monthly activities found.</p>
                  )}
                </div>
              </div>
            </div>
            )}

            <div className="modal-footer">
              <button className="btn-close" onClick={handleCloseDetail}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

