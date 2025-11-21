import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { activityService } from '../services/activityService';
import MonthlyActivityForm from './MonthlyActivityForm';
import './MonthlyActivities.css';

const MonthlyActivities = () => {
  const [filters, setFilters] = useState({
    month: '',
    year: new Date().getFullYear().toString(),
  });
  const [activities, setActivities] = useState([]);
  const [currentMonthData, setCurrentMonthData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    // Load current month data by default
    loadCurrentMonth();
    // Load filtered data
    handleFilter();
  }, []);

  const loadCurrentMonth = async () => {
    try {
      const data = await activityService.getCurrentMonthActivity();
      setCurrentMonthData(data);
    } catch (err) {
      // If current month doesn't exist, that's okay
      console.log('Current month activity not found');
    }
  };

  const handleFilter = async () => {
    setLoading(true);
    setError('');
    setSelectedMonth(null);

    try {
      const data = await activityService.filterMonthlyActivities(filters);
      setActivities(data.activities || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load monthly activities');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleFilter();
  };

  const handleEdit = (activity) => {
    setSelectedMonth(activity);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedMonth(null);
    loadCurrentMonth();
    handleFilter();
  };

  const handleAddNew = () => {
    const today = new Date();
    setSelectedMonth({
      month: today.getMonth() + 1,
      year: today.getFullYear(),
    });
    setShowForm(true);
  };

  const getFieldValue = (activity, fieldName) => {
    const value = activity[fieldName];
    if (value === null || value === undefined || value === '') return 'N/A';
    return value;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Group activities by year
  const groupByYear = () => {
    const yearsMap = {};
    activities.forEach((activity) => {
      const year = activity.year;
      if (!yearsMap[year]) {
        yearsMap[year] = [];
      }
      yearsMap[year].push(activity);
    });
    return yearsMap;
  };

  const yearsMap = groupByYear();

  return (
    <div className="monthly-activities">
      <h2>Monthly Activities</h2>

      <form onSubmit={handleSubmit} className="filter-form">
        <div className="filter-group">
          <label htmlFor="month">Month (1-12)</label>
          <input
            type="number"
            id="month"
            name="month"
            value={filters.month}
            onChange={handleChange}
            min="1"
            max="12"
            placeholder="Optional"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="year">Year</label>
          <input
            type="number"
            id="year"
            name="year"
            value={filters.year}
            onChange={handleChange}
            min="2020"
            max="2100"
            required
          />
        </div>

        <button type="submit" className="btn-filter" disabled={loading}>
          {loading ? 'Loading...' : 'Filter'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {/* Current Month Quick Access */}
      {currentMonthData && (
        <div className="current-month-section">
          <div className="section-header">
            <h3>Current Month</h3>
            <button className="btn-edit-month" onClick={() => handleEdit(currentMonthData)}>
              Edit
            </button>
          </div>
          <div className="current-month-card">
            <div className="month-info">
              <h4>{monthNames[currentMonthData.month - 1]} {currentMonthData.year}</h4>
            </div>
            <div className="month-details">
              <div className="detail-item">
                <span className="label">Counselor Meeting:</span>
                <span className="value">{getFieldValue(currentMonthData, 'one_to_one_meeting_conducted_with_counselor')}</span>
              </div>
              <div className="detail-item">
                <span className="label">Morning Program:</span>
                <span className="value">{getFieldValue(currentMonthData, 'monthly_morning_program')}</span>
              </div>
              <div className="detail-item">
                <span className="label">Book Completed:</span>
                <span className="value">{getFieldValue(currentMonthData, 'monthly_book_completed')}</span>
              </div>
              {currentMonthData.monthly_book_completed !== 'Not Completed' && (
                <>
                  <div className="detail-item">
                    <span className="label">Book Name:</span>
                    <span className="value">{getFieldValue(currentMonthData, 'book_name')}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Book Discussion:</span>
                    <span className="value">{getFieldValue(currentMonthData, 'book_discussion_attended')}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add New Button */}
      <div className="add-new-section">
        <button className="btn-add-new" onClick={handleAddNew}>
          + Add New Monthly Activity
        </button>
      </div>

      {/* Activities Table */}
      {activities.length > 0 ? (
        <div className="activities-results">
          <div className="results-header">
            <h3>Results ({activities.length} monthly activities)</h3>
          </div>

          <div className="monthly-activities-table-container">
            <table className="monthly-activities-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Year</th>
                  <th>Counselor Meeting</th>
                  <th>Morning Program</th>
                  <th>Book Completed</th>
                  <th>Book Name</th>
                  <th>Book Discussion</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activities
                  .sort((a, b) => {
                    if (a.year !== b.year) return b.year - a.year;
                    return b.month - a.month;
                  })
                  .map((activity) => (
                    <tr key={activity.id}>
                      <td>{monthNames[activity.month - 1]}</td>
                      <td>{activity.year}</td>
                      <td>
                        <span className={`status-badge ${activity.one_to_one_meeting_conducted_with_counselor === 'Yes' ? 'completed' : 'not-completed'}`}>
                          {getFieldValue(activity, 'one_to_one_meeting_conducted_with_counselor')}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${activity.monthly_morning_program === 'Attended' ? 'completed' : 'not-completed'}`}>
                          {getFieldValue(activity, 'monthly_morning_program')}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${
                          activity.monthly_book_completed === 'Completed' ? 'completed' : 
                          activity.monthly_book_completed === 'Partially Completed' ? 'partial' : 
                          'not-completed'
                        }`}>
                          {getFieldValue(activity, 'monthly_book_completed')}
                        </span>
                      </td>
                      <td>{getFieldValue(activity, 'book_name')}</td>
                      <td>
                        {activity.monthly_book_completed !== 'Not Completed' ? (
                          <span className={`status-badge ${activity.book_discussion_attended === 'Attended' ? 'completed' : 'not-completed'}`}>
                            {getFieldValue(activity, 'book_discussion_attended')}
                          </span>
                        ) : (
                          <span className="na-text">N/A</span>
                        )}
                      </td>
                      <td>
                        <button 
                          className="btn-edit-row" 
                          onClick={() => handleEdit(activity)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        !loading && (
          <div className="no-results">No monthly activities found for the selected filters.</div>
        )
      )}

      {showForm && selectedMonth && (
        <MonthlyActivityForm
          monthData={selectedMonth}
          onClose={handleCloseForm}
          onSave={handleCloseForm}
        />
      )}
    </div>
  );
};

export default MonthlyActivities;

