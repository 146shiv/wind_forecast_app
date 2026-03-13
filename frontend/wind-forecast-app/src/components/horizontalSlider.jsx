function HorizonSlider({ horizon, setHorizon }) {
  return (
    <div className="horizon-slider">
      <div className="horizon-header">
        <span className="horizon-label">Forecast Horizon</span>
        <span className="horizon-value">{horizon}h</span>
      </div>
      <input
        type="range"
        min={0}
        max={48}
        step={1}
        value={horizon}
        onChange={(e) => setHorizon(Number(e.target.value))}
        className="horizon-range"
      />
      <div className="horizon-range-labels">
        <span>0h</span>
        <span>48h</span>
      </div>
    </div>
  );
}

export default HorizonSlider;

