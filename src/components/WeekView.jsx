import { useState } from 'react';
import { format, parseISO, isToday, isPast } from 'date-fns';
import DailyActivityForm from './DailyActivityForm';
import './WeekView.css';

const WeekView = ({ weekData, onActivityUpdate }) => {
  const [selectedDay, setSelectedDay] = useState(null);

  const getDayFields = (dayName) => {
    const baseFields = ['daily_hearing', 'daily_reading', 'daily_chanting'];
    
    switch (dayName) {
      case 'Tuesday':
        return [...baseFields, 'sport_session_attendance'];
      case 'Thursday':
        return [...baseFields, 'thursday_morning_chanting_session_attendance'];
      case 'Friday':
        return [...baseFields, 'friday_morning_chanting_session_attendance'];
      case 'Sunday':
        return [
          ...baseFields,
          'sunday_offline_program_attendance',
          'sunday_temple_chanting_session_attendance',
          'weekly_discussion_session',
          'weekly_sloka_audio_posted',
          'weekly_seva',
        ];
      default:
        return baseFields;
    }
  };

  const handleDayClick = (day) => {
    if (day.is_editable) {
      setSelectedDay(day);
    }
  };

  const handleCloseForm = () => {
    setSelectedDay(null);
    onActivityUpdate();
  };

  return (
    <div className="week-view">
      <div className="week-header">
        <h2>{weekData.week_name}</h2>
        <p className="week-dates">
          {format(parseISO(weekData.start_date), 'MMM dd')} - {format(parseISO(weekData.end_date), 'MMM dd, yyyy')}
        </p>
      </div>

      <div className="week-grid">
        {weekData.days.map((day, index) => {
          const dayDate = parseISO(day.date);
          const isDayToday = isToday(dayDate);
          const isDayPast = isPast(dayDate) && !isDayToday;

          return (
            <div
              key={index}
              className={`day-card ${!day.is_editable ? 'disabled' : ''} ${isDayToday ? 'today' : ''}`}
              onClick={() => handleDayClick(day)}
            >
              <div className="day-header">
                <h3>{day.day}</h3>
                <span className="day-date">{format(dayDate, 'MMM dd')}</span>
                {isDayToday && <span className="today-badge">Today</span>}
              </div>

              {day.activity ? (
                <div className="day-content">
                  <div className="activity-summary">
                    <div className="activity-item">
                      <span className="label">Hearing:</span>
                      <span className={`value ${day.activity.daily_hearing === 'Completed' ? 'completed' : ''}`}>
                        {day.activity.daily_hearing}
                      </span>
                    </div>
                    <div className="activity-item">
                      <span className="label">Reading:</span>
                      <span className={`value ${day.activity.daily_reading === 'Completed' ? 'completed' : ''}`}>
                        {day.activity.daily_reading}
                      </span>
                    </div>
                    <div className="activity-item">
                      <span className="label">Chanting:</span>
                      <span className="value">{day.activity.daily_chanting}</span>
                    </div>
                  </div>
                  {day.is_editable && (
                    <button className="btn-edit">Edit</button>
                  )}
                </div>
              ) : (
                <div className="day-content empty">
                  {day.is_editable ? (
                    <button className="btn-add">Add Activity</button>
                  ) : (
                    <span className="disabled-text">Not available</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedDay && (
        <DailyActivityForm
          day={selectedDay}
          onClose={handleCloseForm}
          onSave={handleCloseForm}
        />
      )}
    </div>
  );
};

export default WeekView;

