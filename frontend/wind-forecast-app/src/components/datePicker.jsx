function DatePicker({ startTime, endTime, setStartTime, setEndTime }) {
  return (
    <div className="date-picker">
      <div className="date-field">
        <label className="field-label" htmlFor="start-time">
          Start Time
        </label>
        <input
          id="start-time"
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="field-input"
          min="2026-01-01T00:00"
          max="2026-12-31T23:30"
        />
      </div>

      <div className="date-field">
        <label className="field-label" htmlFor="end-time">
          End Time
        </label>
        <input
          id="end-time"
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="field-input"
          min="2026-01-01T00:00"
          max="2026-12-31T23:30"
        />
      </div>
    </div>
  );
}

export default DatePicker;

