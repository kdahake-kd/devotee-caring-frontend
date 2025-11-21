import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { activityService } from '../services/activityService';
import './FilterActivities.css';

const FilterActivities = () => {
  const [filters, setFilters] = useState({
    month: '',
    year: new Date().getFullYear().toString(),
  });
  const [activities, setActivities] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(null); // Selected month when filtering by year only
  const [selectedWeek, setSelectedWeek] = useState(null); // Selected week to show activities

  useEffect(() => {
    // Load current year data by default
    handleFilter();
  }, []);

  const handleFilter = async () => {
    setLoading(true);
    setError('');
    setSelectedMonth(null);
    setSelectedWeek(null);

    try {
      const data = await activityService.filterActivities(filters);
      setActivities(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load activities');
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

  const getFieldValue = (activity, fieldName) => {
    const value = activity[fieldName];
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return value;
  };

  // Get day-specific fields that are relevant for a given day
  const getRelevantDayFields = (dayName) => {
    const dayFields = {
      'Monday': [],
      'Tuesday': [],
      'Wednesday': [],
      'Thursday': ['thursday_morning_chanting_session_attendance'],
      'Friday': ['friday_morning_chanting_session_attendance'],
      'Saturday': [],
      'Sunday': [
        'sunday_offline_program_attendance',
        'sunday_temple_chanting_session_attendance',
        'weekly_discussion_session',
        'weekly_sloka_audio_posted',
        'weekly_seva'
      ]
    };
    return dayFields[dayName] || [];
  };

  // Check if a field should be displayed for a given activity
  const shouldShowField = (activity, fieldName) => {
    // Always show base fields
    const baseFields = ['daily_hearing', 'daily_reading', 'daily_chanting', 'sport_session_attendance'];
    if (baseFields.includes(fieldName)) {
      return true;
    }
    
    // For day-specific fields, check if they're relevant for this day
    const dayName = format(parseISO(activity.date), 'EEEE');
    const relevantFields = getRelevantDayFields(dayName);
    return relevantFields.includes(fieldName);
  };

  // Group weeks by month
  const groupWeeksByMonth = () => {
    if (!activities || !activities.weeks) return {};

    const monthsMap = {};
    activities.weeks.forEach((week) => {
      const monthNum = week.month;
      const monthName = format(parseISO(week.start_date), 'MMMM yyyy');
      
      if (!monthsMap[monthNum]) {
        monthsMap[monthNum] = {
          month: monthNum,
          monthName: monthName,
          weeks: [],
        };
      }
      monthsMap[monthNum].weeks.push(week);
    });

    return monthsMap;
  };

  const monthsMap = groupWeeksByMonth();
  const hasMonthFilter = filters.month && filters.month !== '';
  const hasYearOnly = !hasMonthFilter && filters.year;

  // Get weeks to display based on current selection
  const getWeeksToDisplay = () => {
    if (!activities || !activities.weeks) return [];

    if (hasMonthFilter) {
      // If month is selected, show all weeks for that month
      return activities.weeks;
    } else if (selectedMonth) {
      // If a month is selected from year view, show weeks for that month
      return monthsMap[selectedMonth]?.weeks || [];
    }
    return [];
  };

  const weeksToDisplay = getWeeksToDisplay();

  // Get activities for selected week
  const getSelectedWeekActivities = () => {
    if (!selectedWeek || !activities) return [];
    
    const week = activities.weeks.find((w) => w.week_id === selectedWeek);
    return week ? week.activities : [];
  };

  const selectedWeekActivities = getSelectedWeekActivities();

  const handleMonthClick = (monthNum) => {
    setSelectedMonth(selectedMonth === monthNum ? null : monthNum);
    setSelectedWeek(null); // Reset week selection when month changes
  };

  const handleWeekClick = (weekId) => {
    setSelectedWeek(selectedWeek === weekId ? null : weekId);
  };

  return (
    <div className="filter-activities">
      <h2>Filter Activities</h2>

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

      {activities && (
        <div className="activities-results">
          <div className="results-header">
            {selectedWeek ? (
              <h3>Week Activities</h3>
            ) : (hasMonthFilter || selectedMonth) ? (
              <h3>Week vise activities</h3>
            ) : hasYearOnly && !selectedMonth ? (
              <h3>Month vise activities</h3>
            ) : (
              <h3>Results ({activities.total_count} activities)</h3>
            )}
            <p className="results-subtitle">
              {hasYearOnly && !selectedMonth && 'Click on a month card to view weeks'}
              {hasYearOnly && selectedMonth && !selectedWeek && 'Click on a week card to view activities'}
              {hasMonthFilter && !selectedWeek && 'Click on a week card to view activities'}
              {selectedWeek && 'Week activities'}
            </p>
          </div>

          {activities.weeks && activities.weeks.length > 0 ? (
            <>
              {/* Show Month Cards when filtering by year only and no month selected */}
              {hasYearOnly && !selectedMonth && (
                <div className="month-cards-row">
                  {Object.values(monthsMap)
                    .sort((a, b) => a.month - b.month)
                    .map((monthData) => (
                      <div
                        key={monthData.month}
                        className="month-card"
                        onClick={() => handleMonthClick(monthData.month)}
                      >
                        <div className="month-card-header">
                          <h3>{monthData.monthName}</h3>
                        </div>
                        <div className="month-card-body">
                          <p className="weeks-count">{monthData.weeks.length} Week{monthData.weeks.length !== 1 ? 's' : ''}</p>
                          <div className="card-expand-indicator">▶</div>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Show Week Cards when month is selected (from filter or from month card click) */}
              {((hasMonthFilter && !selectedWeek) || (selectedMonth && !selectedWeek)) && (
                <div className="week-cards-container">
                  {(hasMonthFilter || selectedMonth) && (
                    <div className="week-cards-header">
                      <h4>
                        {hasMonthFilter 
                          ? format(parseISO(activities.weeks[0]?.start_date || ''), 'MMMM yyyy')
                          : monthsMap[selectedMonth]?.monthName
                        }
                      </h4>
                      {selectedMonth && (
                        <button className="back-to-month-btn" onClick={() => setSelectedMonth(null)}>
                          ← Back to Months
                        </button>
                      )}
                    </div>
                  )}
                  <div className="week-cards-row">
                    {weeksToDisplay.map((week) => (
                      <div
                        key={week.week_id}
                        className="week-card"
                        onClick={() => handleWeekClick(week.week_id)}
                      >
                        <div className="week-card-header">
                          <h4>{week.week_name}</h4>
                          {week.is_current_week && <span className="current-week-badge">Current</span>}
                        </div>
                        <div className="week-card-body">
                          <p className="week-dates">
                            {format(parseISO(week.start_date), 'MMM dd')} - {format(parseISO(week.end_date), 'MMM dd')}
                          </p>
                          <p className="activities-count">{week.activities.length} Day{week.activities.length !== 1 ? 's' : ''}</p>
                          <div className="card-expand-indicator">▶</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Show Activities Table when a week is selected */}
              {selectedWeek && selectedWeekActivities.length > 0 && (
                <div className="week-activities-container">
                  <div className="week-activities-header">
                    <div>
                      <h3>
                        {weeksToDisplay.find((w) => w.week_id === selectedWeek)?.week_name || 'Week Activities'}
                      </h3>
                      <p className="week-dates-header">
                        Start Week - {format(parseISO(weeksToDisplay.find((w) => w.week_id === selectedWeek)?.start_date || ''), 'MMM dd')} - End Week {format(parseISO(weeksToDisplay.find((w) => w.week_id === selectedWeek)?.end_date || ''), 'MMM dd')}
                      </p>
                    </div>
                    <button className="close-week-btn" onClick={() => setSelectedWeek(null)}>
                      ← Back to Weeks
                    </button>
                  </div>

                  <div className="activities-table-container">
                    <table className="activities-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Day</th>
                          <th>Hearing</th>
                          <th>Reading</th>
                          <th>Chanting</th>
                          <th>Day-Specific Activities</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedWeekActivities
                          .sort((a, b) => new Date(a.date) - new Date(b.date))
                          .map((activity) => (
                            <tr key={activity.id}>
                              <td>{format(parseISO(activity.date), 'MMM dd, yyyy')}</td>
                              <td>{format(parseISO(activity.date), 'EEEE')}</td>
                              <td>
                                <span className={`status-badge ${activity.daily_hearing === 'Completed' ? 'completed' : 'not-completed'}`}>
                                  {getFieldValue(activity, 'daily_hearing')}
                                </span>
                              </td>
                              <td>
                                <span className={`status-badge ${activity.daily_reading === 'Completed' ? 'completed' : 'not-completed'}`}>
                                  {getFieldValue(activity, 'daily_reading')}
                                </span>
                              </td>
                              <td>
                                <span className="chanting-badge">
                                  {(() => {
                                    const chantingValue = activity.daily_chanting || 0;
                                    const chantingNum = typeof chantingValue === 'string' ? parseInt(chantingValue) : chantingValue;
                                    return `${chantingNum} ${chantingNum === 1 ? 'Round' : 'Rounds'}`;
                                  })()}
                                </span>
                              </td>
                              <td>
                                <div className="day-specific-activities">
                                  {(() => {
                                    const fields = [
                                      { name: 'sport_session_attendance', label: 'Sport', activityType: 'sport' },
                                      { name: 'thursday_morning_chanting_session_attendance', label: 'Thu Chanting', activityType: 'chanting' },
                                      { name: 'friday_morning_chanting_session_attendance', label: 'Fri Chanting', activityType: 'chanting' },
                                      { name: 'sunday_offline_program_attendance', label: 'Sun Program', activityType: 'program' },
                                      { name: 'sunday_temple_chanting_session_attendance', label: 'Sun Temple', activityType: 'chanting' },
                                      { name: 'weekly_discussion_session', label: 'Discussion', activityType: 'discussion' },
                                      { name: 'weekly_sloka_audio_posted', label: 'Sloka', activityType: 'sloka' },
                                      { name: 'weekly_seva', label: 'Seva', activityType: 'seva' }
                                    ];
                                    
                                    const visibleFields = fields.filter(field => 
                                      shouldShowField(activity, field.name) && activity[field.name]
                                    );
                                    
                                    if (visibleFields.length === 0) {
                                      return <span className="activity-tag no-activity">No day-specific activities</span>;
                                    }
                                    
                                    return visibleFields.map(field => {
                                      const value = getFieldValue(activity, field.name);
                                      return (
                                        <span 
                                          key={field.name} 
                                          className="activity-tag activity-tag-blue"
                                          data-status={value}
                                        >
                                          <strong>{field.label}:</strong> {value}
                                        </span>
                                      );
                                    });
                                  })()}
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="no-results">No activities found for the selected filters.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterActivities;
