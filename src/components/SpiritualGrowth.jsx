import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import './SpiritualGrowth.css';

const SpiritualGrowth = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSpiritualGrowth();
  }, []);

  const fetchSpiritualGrowth = async () => {
    try {
      setLoading(true);
      const data = await authService.getSpiritualGrowth();
      setStats(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load spiritual growth data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="spiritual-growth-loading">Loading your spiritual journey...</div>;
  }

  if (error) {
    return <div className="spiritual-growth-error">{error}</div>;
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="spiritual-growth-container">
      <div className="spiritual-growth-header">
        <h2>📿 My Spiritual Growth</h2>
        <p className="subtitle">Your journey of devotion and progress</p>
      </div>

      <div className="stats-grid">
        {/* Total Chanting Rounds */}
        <div className="stat-card stat-card-primary">
          <div className="stat-icon">
            <img src="/images/mahamantralogo.png" alt="Mahamantra Logo" className="mahamantra-logo" />
          </div>
          <div className="stat-content">
            <h3>Hare Krishna Mahamantra Count</h3>
            <div className="stat-value">{stats.total_chanting_rounds?.toLocaleString() || 0}</div>
            <p className="stat-description">Rounds chanted till now</p>
          </div>
          <div className="stat-glow"></div>
        </div>

        {/* Highest Chanting Round */}
        <div className="stat-card stat-card-secondary">
          <div className="stat-icon">✨</div>
          <div className="stat-content">
            <h3>Highest Chanting Round in One Day</h3>
            <div className="stat-value">{stats.highest_chanting_rounds || 0}</div>
            <p className="stat-description">Best day performance</p>
          </div>
          <div className="stat-glow"></div>
        </div>

        {/* Sport Session Attendance */}
        <div className="stat-card stat-card-success">
          <div className="stat-icon">🙏</div>
          <div className="stat-content">
            <h3>Sport Sessions</h3>
            <div className="stat-value">{stats.sport_session_attendance_count || 0}</div>
            <p className="stat-description">Sessions attended</p>
          </div>
          <div className="stat-glow"></div>
        </div>

        {/* Books Completed */}
        <div className="stat-card stat-card-info">
          <div className="stat-icon">📿</div>
          <div className="stat-content">
            <h3>Spiritual Book Completed</h3>
            <div className="stat-value">{stats.total_books_completed || 0}</div>
            <p className="stat-description">Books fully read</p>
          </div>
          <div className="stat-glow"></div>
        </div>

        {/* Morning Program */}
        <div className="stat-card stat-card-warning">
          <div className="stat-icon">
            <img src="/images/mahamantralogo.png" alt="Mahamantra Logo" className="mahamantra-logo" />
          </div>
          <div className="stat-content">
            <h3>Morning Programs</h3>
            <div className="stat-value">{stats.morning_program_count || 0}</div>
            <p className="stat-description">Programs attended</p>
          </div>
          <div className="stat-glow"></div>
        </div>

        {/* Thursday Chanting */}
        <div className="stat-card stat-card-purple">
          <div className="stat-icon">
            <img src="/images/mahamantralogo.png" alt="Mahamantra Logo" className="mahamantra-logo" />
          </div>
          <div className="stat-content">
            <h3>Thursday Chanting</h3>
            <div className="stat-value">{stats.thursday_chanting_count || 0}</div>
            <p className="stat-description">Sessions attended</p>
          </div>
          <div className="stat-glow"></div>
        </div>

        {/* Sunday Offline Program */}
        <div className="stat-card stat-card-orange">
          <div className="stat-icon">
            <img src="/images/mahamantralogo.png" alt="Mahamantra Logo" className="mahamantra-logo" />
          </div>
          <div className="stat-content">
            <h3>Sunday Offline Temple Program</h3>
            <div className="stat-value">{stats.sunday_offline_program_count || 0}</div>
            <p className="stat-description">Programs attended</p>
          </div>
          <div className="stat-glow"></div>
        </div>

        {/* Sunday Temple Chanting */}
        <div className="stat-card stat-card-blue">
          <div className="stat-icon">
            <img src="/images/mahamantralogo.png" alt="Mahamantra Logo" className="mahamantra-logo" />
          </div>
          <div className="stat-content">
            <h3>Sunday Temple Chanting</h3>
            <div className="stat-value">{stats.sunday_temple_chanting_count || 0}</div>
            <p className="stat-description">Sessions attended</p>
          </div>
          <div className="stat-glow"></div>
        </div>

        {/* Weekly Seva */}
        <div className="stat-card stat-card-green">
          <div className="stat-icon">🙏</div>
          <div className="stat-content">
            <h3>Weekly Seva</h3>
            <div className="stat-value">{stats.weekly_seva_count || 0}</div>
            <p className="stat-description">Weeks of service</p>
          </div>
          <div className="stat-glow"></div>
        </div>
      </div>

      {/* Books Section */}
      <div className="books-section">
        <div className="books-completed">
          <h3>📿 Spiritual Books Completed</h3>
          {stats.completed_books && stats.completed_books.length > 0 ? (
            <div className="books-list">
              {stats.completed_books.map((book, index) => (
                <div key={index} className="book-item book-completed">
                  <span className="book-icon">✅</span>
                  <span className="book-name">{book}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-books">No books completed yet</p>
          )}
        </div>

        <div className="books-partial">
          <h3>📝 Partially Completed Books</h3>
          {stats.partially_completed_books && stats.partially_completed_books.length > 0 ? (
            <div className="books-list">
              {stats.partially_completed_books.map((book, index) => (
                <div key={index} className="book-item book-partial">
                  <span className="book-icon">⏳</span>
                  <span className="book-name">{book}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-books">No partially completed books</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpiritualGrowth;

