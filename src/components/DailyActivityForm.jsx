import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { activityService } from '../services/activityService';
import { FlyingBoxes, SuccessCelebration } from './SpiritualAnimations';
import './DailyActivityForm.css';

const DailyActivityForm = ({ day, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    daily_hearing: 'Not Completed',
    daily_reading: 'Not Completed',
    daily_chanting: 0,
    sport_session_attendance: 'Not Attended',
    thursday_morning_chanting_session_attendance: 'Not Attended',
    friday_morning_chanting_session_attendance: 'Not Attended',
    sunday_offline_program_attendance: 'Not Attended',
    sunday_temple_chanting_session_attendance: 'Not Attended',
    weekly_discussion_session: 'Not Attended',
    weekly_sloka_audio_posted: 'No',
    weekly_seva: 'No',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFlyingBoxes, setShowFlyingBoxes] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (day.activity) {
      setFormData({
        daily_hearing: day.activity.daily_hearing || 'Not Completed',
        daily_reading: day.activity.daily_reading || 'Not Completed',
        daily_chanting: day.activity.daily_chanting || 0,
        sport_session_attendance: day.activity.sport_session_attendance || 'Not Attended',
        thursday_morning_chanting_session_attendance: day.activity.thursday_morning_chanting_session_attendance || 'Not Attended',
        friday_morning_chanting_session_attendance: day.activity.friday_morning_chanting_session_attendance || 'Not Attended',
        sunday_offline_program_attendance: day.activity.sunday_offline_program_attendance || 'Not Attended',
        sunday_temple_chanting_session_attendance: day.activity.sunday_temple_chanting_session_attendance || 'Not Attended',
        weekly_discussion_session: day.activity.weekly_discussion_session || 'Not Attended',
        weekly_sloka_audio_posted: day.activity.weekly_sloka_audio_posted || 'No',
        weekly_seva: day.activity.weekly_seva || 'No',
      });
    }
  }, [day]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'daily_chanting' ? parseInt(value) || 0 : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Only send fields that are editable for this day
      const editableFields = day.editable_fields || [];
      const submitData = {};
      
      editableFields.forEach(field => {
        if (formData[field] !== undefined) {
          submitData[field] = formData[field];
        }
      });

      await activityService.addOrEditDay(day.date, submitData);
      
      // Trigger animations
      setShowFlyingBoxes(true);
      setShowSuccess(true);
      
      // Close form after animation
      setTimeout(() => {
        onSave();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save activity');
    } finally {
      setLoading(false);
    }
  };

  const renderField = (fieldName, label, options, type = 'select') => {
    if (!day.editable_fields?.includes(fieldName)) {
      return null;
    }

    if (type === 'number') {
      return (
        <div className="form-group" key={fieldName}>
          <label>{label}</label>
          <input
            type="number"
            name={fieldName}
            value={formData[fieldName]}
            onChange={handleChange}
            min="0"
            className="form-input"
          />
        </div>
      );
    }

    return (
      <div className="form-group" key={fieldName}>
        <label>{label}</label>
        <select
          name={fieldName}
          value={formData[fieldName]}
          onChange={handleChange}
          className="form-select"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <>
      <FlyingBoxes trigger={showFlyingBoxes} onComplete={() => setShowFlyingBoxes(false)} />
      <SuccessCelebration trigger={showSuccess} message="Hare Krishna! Activity Saved!" />
      
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{day.day} - {format(parseISO(day.date), 'MMM dd, yyyy')}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {renderField('daily_hearing', 'Daily Hearing', [
            { value: 'Completed', label: 'Completed' },
            { value: 'Not Completed', label: 'Not Completed' },
          ])}

          {renderField('daily_reading', 'Daily Reading', [
            { value: 'Completed', label: 'Completed' },
            { value: 'Not Completed', label: 'Not Completed' },
          ])}

          {renderField('daily_chanting', 'Daily Chanting (rounds)', [], 'number')}

          {renderField('sport_session_attendance', 'Sport Session Attendance', [
            { value: 'Attended', label: 'Attended' },
            { value: 'Not Attended', label: 'Not Attended' },
            { value: 'No Session Today', label: 'No Session Today' },
          ])}

          {renderField('thursday_morning_chanting_session_attendance', 'Thursday Morning Chanting Session', [
            { value: 'Attended', label: 'Attended' },
            { value: 'Not Attended', label: 'Not Attended' },
          ])}

          {renderField('friday_morning_chanting_session_attendance', 'Friday Morning Chanting Session', [
            { value: 'Attended', label: 'Attended' },
            { value: 'Not Attended', label: 'Not Attended' },
          ])}

          {renderField('sunday_offline_program_attendance', 'Sunday Offline Program Attendance', [
            { value: 'Attended', label: 'Attended' },
            { value: 'Not Attended', label: 'Not Attended' },
          ])}

          {renderField('sunday_temple_chanting_session_attendance', 'Sunday Temple Chanting Session', [
            { value: 'Attended', label: 'Attended' },
            { value: 'Not Attended', label: 'Not Attended' },
          ])}

          {renderField('weekly_discussion_session', 'Weekly Discussion Session', [
            { value: 'Online', label: 'Online' },
            { value: 'Offline', label: 'Offline' },
            { value: 'Not Attended', label: 'Not Attended' },
          ])}

          {renderField('weekly_sloka_audio_posted', 'Weekly Sloka Audio Posted', [
            { value: 'Yes', label: 'Yes' },
            { value: 'No', label: 'No' },
          ])}

          {renderField('weekly_seva', 'Weekly Seva', [
            { value: 'Yes', label: 'Yes' },
            { value: 'No', label: 'No' },
          ])}

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

export default DailyActivityForm;

