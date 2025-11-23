import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { qrService } from '../services/qrService';
import './QuickEntry.css';

const QuickEntry = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({});
  const [fieldDefinitions, setFieldDefinitions] = useState({});
  const [userName, setUserName] = useState('');
  const [dayName, setDayName] = useState('');
  const [hasExistingData, setHasExistingData] = useState(false);

  useEffect(() => {
    if (token) {
      validateToken();
    } else {
      setError('Invalid QR code. Please scan a valid QR code.');
      setLoading(false);
    }
  }, [token]);

  const validateToken = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await qrService.validateQrToken(token);
      
      if (data.valid) {
        setUserName(data.user_name);
        setDayName(data.day_name);
        setHasExistingData(data.has_existing_data);
        setFieldDefinitions(data.field_definitions);
        
        // Initialize form data with existing values
        const initialData = {};
        Object.keys(data.field_definitions).forEach(key => {
          initialData[key] = data.field_definitions[key].value;
        });
        setFormData(initialData);
      } else {
        setError('Invalid QR token. Please generate a new QR code.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to validate QR code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      setSuccess(false);

      // Prepare submission data
      const submitData = {
        date: new Date().toISOString().split('T')[0],
        ...formData
      };

      const response = await qrService.submitQuickEntry(token, submitData);
      
      setSuccess(true);
      setHasExistingData(true);
      
      // Show success message for 3 seconds, then allow editing again
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save activities. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (fieldName, definition) => {
    if (definition.type === 'number') {
      return (
        <div key={fieldName} className="quick-entry-field">
          <label htmlFor={fieldName}>{definition.label}</label>
          <input
            type="number"
            id={fieldName}
            name={fieldName}
            value={formData[fieldName] || 0}
            onChange={(e) => handleChange(fieldName, parseInt(e.target.value) || 0)}
            min={definition.min || 0}
            className="quick-entry-input"
            required
          />
        </div>
      );
    }

    if (definition.type === 'select') {
      return (
        <div key={fieldName} className="quick-entry-field">
          <label htmlFor={fieldName}>{definition.label}</label>
          <select
            id={fieldName}
            name={fieldName}
            value={formData[fieldName] || ''}
            onChange={(e) => handleChange(fieldName, e.target.value)}
            className="quick-entry-select"
            required
          >
            {definition.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="quick-entry-container">
        <div className="quick-entry-loading">
          <div className="loading-spinner"></div>
          <p>Loading your daily entry form...</p>
        </div>
      </div>
    );
  }

  if (error && !fieldDefinitions || Object.keys(fieldDefinitions).length === 0) {
    return (
      <div className="quick-entry-container">
        <div className="quick-entry-error">
          <div className="error-icon">⚠️</div>
          <h2>Error</h2>
          <p>{error}</p>
          <p className="error-help">
            Please make sure you scanned a valid QR code from your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="quick-entry-container">
      <div className="quick-entry-header">
        <div className="header-icon">📿</div>
        <h1>Daily Activities Entry</h1>
        <p className="welcome-text">Welcome, {userName}</p>
        <p className="day-info">Today is {dayName}</p>
        {hasExistingData && (
          <p className="edit-note">You have existing data for today. You can update it below.</p>
        )}
      </div>

      {error && !success && (
        <div className="quick-entry-error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="quick-entry-success-message">
          ✅ {dayName}'s activities saved successfully! You can continue editing if needed.
        </div>
      )}

      <form onSubmit={handleSubmit} className="quick-entry-form">
        {Object.keys(fieldDefinitions).map(fieldName => 
          renderField(fieldName, fieldDefinitions[fieldName])
        )}

        <div className="quick-entry-actions">
          <button 
            type="submit" 
            className="btn-submit-entry"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : hasExistingData ? 'Update Entry' : 'Save Entry'}
          </button>
        </div>
      </form>

      <div className="quick-entry-footer">
        <p>📱 Quick Entry via QR Code</p>
        <p className="footer-note">This form only shows today's relevant fields. Scan your QR code again anytime to edit.</p>
      </div>
    </div>
  );
};

export default QuickEntry;

