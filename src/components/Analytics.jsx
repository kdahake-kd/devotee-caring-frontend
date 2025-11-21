import { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import './Analytics.css';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Filter states
  const [filterType, setFilterType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterWeek, setFilterWeek] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [selectedDevoteeId, setSelectedDevoteeId] = useState('');
  const [devotees, setDevotees] = useState([]);

  useEffect(() => {
    fetchDevotees();
    fetchAnalytics();
  }, []);

  const fetchDevotees = async () => {
    try {
      const data = await adminService.getAllDevotees('');
      setDevotees(data.devotees || []);
    } catch (err) {
      console.error('Failed to fetch devotees:', err);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    
    try {
      const filters = {};
      
      if (filterType === 'range') {
        if (startDate && endDate) {
          filters.start_date = startDate;
          filters.end_date = endDate;
        }
      } else if (filterType === 'week') {
        if (filterWeek) {
          filters.week_id = filterWeek;
        }
      } else if (filterType === 'month') {
        if (filterMonth) {
          filters.month = filterMonth;
        }
      } else if (filterType === 'year') {
        if (filterYear) {
          filters.year = filterYear;
        }
      }
      
      if (selectedDevoteeId) {
        filters.devotee_id = selectedDevoteeId;
      }
      
      const data = await adminService.getAnalytics(filters);
      setAnalyticsData(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = () => {
    fetchAnalytics();
  };

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b'];

  // Prepare chart data
  const prepareDailyChartData = () => {
    if (!analyticsData?.daily_chart_data) return [];
    return analyticsData.daily_chart_data.map(item => ({
      date: format(new Date(item.date), 'MMM dd'),
      hearing: item.hearing_completed,
      reading: item.reading_completed,
      chanting: item.chanting_rounds,
    }));
  };

  const prepareWeeklyChartData = () => {
    if (!analyticsData?.weekly_chart_data) return [];
    return analyticsData.weekly_chart_data.map(item => ({
      week: item.week_name || 'Week',
      hearing: item.hearing_completed,
      reading: item.reading_completed,
      chanting: item.chanting_rounds,
    }));
  };

  const prepareMonthlyChartData = () => {
    if (!analyticsData?.monthly_chart_data) return [];
    return analyticsData.monthly_chart_data.map(item => ({
      month: `${item.month}/${item.year}`,
      hearing: item.hearing_completed,
      reading: item.reading_completed,
      chanting: item.chanting_rounds,
    }));
  };

  const completionPieData = analyticsData?.summary ? [
    { name: 'Hearing Completed', value: analyticsData.summary.hearing_completion_rate },
    { name: 'Reading Completed', value: analyticsData.summary.reading_completion_rate },
    { name: 'Not Completed', value: 100 - (analyticsData.summary.hearing_completion_rate + analyticsData.summary.reading_completion_rate) / 2 },
  ] : [];

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h2>📊 Analytics Dashboard</h2>
        <p>View comprehensive activity statistics and trends</p>
      </div>

      {/* Filter Section */}
      <div className="analytics-filters">
        <div className="filter-section">
          <h3>Filters</h3>
          <div className="filter-controls-grid">
            <div className="filter-group">
              <label>Filter Type:</label>
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  handleFilterChange();
                }}
              >
                <option value="all">All Data</option>
                <option value="range">Date Range</option>
                <option value="week">By Week</option>
                <option value="month">By Month</option>
                <option value="year">By Year</option>
              </select>
            </div>

            {filterType === 'range' && (
              <>
                <div className="filter-group">
                  <label>Start Date:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      handleFilterChange();
                    }}
                  />
                </div>
                <div className="filter-group">
                  <label>End Date:</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      handleFilterChange();
                    }}
                  />
                </div>
              </>
            )}

            {filterType === 'week' && (
              <div className="filter-group">
                <label>Week ID:</label>
                <input
                  type="number"
                  placeholder="Enter week ID"
                  value={filterWeek}
                  onChange={(e) => {
                    setFilterWeek(e.target.value);
                    handleFilterChange();
                  }}
                />
              </div>
            )}

            {filterType === 'month' && (
              <div className="filter-group">
                <label>Month:</label>
                <select
                  value={filterMonth}
                  onChange={(e) => {
                    setFilterMonth(e.target.value);
                    handleFilterChange();
                  }}
                >
                  <option value="">Select Month</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                    <option key={m} value={m}>
                      {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {filterType === 'year' && (
              <div className="filter-group">
                <label>Year:</label>
                <input
                  type="number"
                  placeholder="Enter year"
                  value={filterYear}
                  onChange={(e) => {
                    setFilterYear(e.target.value);
                    handleFilterChange();
                  }}
                  min="2020"
                  max="2100"
                />
              </div>
            )}

            <div className="filter-group">
              <label>Filter by Devotee (Optional):</label>
              <select
                value={selectedDevoteeId}
                onChange={(e) => {
                  setSelectedDevoteeId(e.target.value);
                  handleFilterChange();
                }}
              >
                <option value="">All Devotees</option>
                {devotees.map((devotee) => (
                  <option key={devotee.id} value={devotee.id}>
                    {devotee.full_name} ({devotee.username})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading analytics...</div>
      ) : analyticsData ? (
        <>
          {/* Summary Cards */}
          <div className="analytics-summary">
            <div className="summary-card">
              <div className="summary-icon">📈</div>
              <div className="summary-content">
                <h3>Total Activities</h3>
                <p className="summary-value">{analyticsData.summary.total_activities}</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon">👥</div>
              <div className="summary-content">
                <h3>Total Devotees</h3>
                <p className="summary-value">{analyticsData.summary.total_devotees}</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon">📖</div>
              <div className="summary-content">
                <h3>Hearing Completion</h3>
                <p className="summary-value">{analyticsData.summary.hearing_completion_rate}%</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon">📚</div>
              <div className="summary-content">
                <h3>Reading Completion</h3>
                <p className="summary-value">{analyticsData.summary.reading_completion_rate}%</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon">
                <img src="/images/iskcon-logo.png" alt="ISKCON Logo" className="summary-logo" />
              </div>
              <div className="summary-content">
                <h3>Total Chanting Rounds</h3>
                <p className="summary-value">{analyticsData.summary.total_chanting_rounds}</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon">⚽</div>
              <div className="summary-content">
                <h3>Sport Attendance</h3>
                <p className="summary-value">{analyticsData.summary.sport_attendance_rate}%</p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="charts-container">
            {/* Daily Activity Chart */}
            {prepareDailyChartData().length > 0 && (
              <div className="chart-card">
                <h3>Daily Activity Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={prepareDailyChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="hearing" stroke="#667eea" strokeWidth={2} name="Hearing Completed" />
                    <Line type="monotone" dataKey="reading" stroke="#764ba2" strokeWidth={2} name="Reading Completed" />
                    <Line type="monotone" dataKey="chanting" stroke="#4facfe" strokeWidth={2} name="Chanting Rounds" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Weekly Activity Chart */}
            {prepareWeeklyChartData().length > 0 && (
              <div className="chart-card">
                <h3>Weekly Activity Comparison</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={prepareWeeklyChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="hearing" fill="#667eea" name="Hearing Completed" />
                    <Bar dataKey="reading" fill="#764ba2" name="Reading Completed" />
                    <Bar dataKey="chanting" fill="#4facfe" name="Chanting Rounds" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Monthly Activity Chart */}
            {prepareMonthlyChartData().length > 0 && (
              <div className="chart-card">
                <h3>Monthly Activity Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={prepareMonthlyChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="hearing" fill="#667eea" name="Hearing Completed" />
                    <Bar dataKey="reading" fill="#764ba2" name="Reading Completed" />
                    <Bar dataKey="chanting" fill="#4facfe" name="Chanting Rounds" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Completion Rate Pie Chart */}
            {completionPieData.length > 0 && (
              <div className="chart-card">
                <h3>Completion Rate Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={completionPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {completionPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="no-data">No analytics data available</div>
      )}
    </div>
  );
};

export default Analytics;

