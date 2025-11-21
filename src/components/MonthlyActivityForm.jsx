import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { activityService } from '../services/activityService';
import { FlyingBoxes, SuccessCelebration } from './SpiritualAnimations';
import './MonthlyActivityForm.css';

const MonthlyActivityForm = ({ monthData, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    one_to_one_meeting_conducted_with_counselor: 'No',
    monthly_morning_program: 'Not Attended',
    monthly_book_completed: 'Not Completed',
    book_name: '',
    book_discussion_attended: 'Not Attended',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFlyingBoxes, setShowFlyingBoxes] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (monthData) {
      setFormData({
        month: monthData.month || new Date().getMonth() + 1,
        year: monthData.year || new Date().getFullYear(),
        one_to_one_meeting_conducted_with_counselor: monthData.one_to_one_meeting_conducted_with_counselor || 'No',
        monthly_morning_program: monthData.monthly_morning_program || 'Not Attended',
        monthly_book_completed: monthData.monthly_book_completed || 'Not Completed',
        book_name: monthData.book_name || '',
        book_discussion_attended: monthData.book_discussion_attended || 'Not Attended',
      });
    }
  }, [monthData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Get week IDs if available
      const weekIds = monthData?.weeks?.map(week => week.id) || [];
      
      await activityService.addOrEditMonthlyActivity({
        ...formData,
        week_ids: weekIds,
      });
      
      // Trigger animations
      setShowFlyingBoxes(true);
      setShowSuccess(true);
      
      // Close form after animation
      setTimeout(() => {
        onSave();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save monthly activity');
    } finally {
      setLoading(false);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <>
      <FlyingBoxes trigger={showFlyingBoxes} onComplete={() => setShowFlyingBoxes(false)} />
      <SuccessCelebration trigger={showSuccess} message="Hare Krishna! Monthly Activity Saved!" />
      
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content monthly-form" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            Monthly Activity - {monthNames[formData.month - 1]} {formData.year}
          </h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>One-to-One Meeting Conducted with Counselor</label>
            <select
              name="one_to_one_meeting_conducted_with_counselor"
              value={formData.one_to_one_meeting_conducted_with_counselor}
              onChange={handleChange}
              className="form-select"
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div className="form-group">
            <label>Monthly Morning Program</label>
            <select
              name="monthly_morning_program"
              value={formData.monthly_morning_program}
              onChange={handleChange}
              className="form-select"
            >
              <option value="Attended">Attended</option>
              <option value="Not Attended">Not Attended</option>
            </select>
          </div>

          <div className="form-group">
            <label>Monthly Book Completed</label>
            <select
              name="monthly_book_completed"
              value={formData.monthly_book_completed}
              onChange={handleChange}
              className="form-select"
            >
              <option value="Completed">Completed</option>
              <option value="Partially Completed">Partially Completed</option>
              <option value="Not Completed">Not Completed</option>
            </select>
          </div>

          {formData.monthly_book_completed !== 'Not Completed' && (
            <>
              <div className="form-group">
                <label>Book Name</label>
                <input
                  type="text"
                  name="book_name"
                  value={formData.book_name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter book name"
                />
              </div>

              <div className="form-group">
                <label>Book Discussion Attended</label>
                <select
                  name="book_discussion_attended"
                  value={formData.book_discussion_attended}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="Attended">Attended</option>
                  <option value="Not Attended">Not Attended</option>
                </select>
              </div>
            </>
          )}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};

export default MonthlyActivityForm;

