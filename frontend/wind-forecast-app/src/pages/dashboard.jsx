import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import DatePicker from '../components/datePicker.jsx';
import HorizonSlider from '../components/horizontalSlider.jsx';
import WindChart from '../components/windChart.jsx';
import { fetchWindChartData } from '../api/windApi.js';

function Dashboard() {
  // Default range in 2026 so chart shows BMRS data (actual vs forecast)
  const [startTime, setStartTime] = useState(
    dayjs('2026-03-13T00:00:00Z').format('YYYY-MM-DDTHH:mm'),
  );
  const [endTime, setEndTime] = useState(
    dayjs('2026-03-15T23:00:00Z').format('YYYY-MM-DDTHH:mm'),
  );
  const [horizon, setHorizon] = useState(3);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchChartData = async () => {
      if (!startTime || !endTime) return;

      const startIso = dayjs(startTime).toISOString();
      const endIso = dayjs(endTime).toISOString();

      setLoading(true);
      setError('');

      try {
        const data = await fetchWindChartData({
          startTime: startIso,
          endTime: endIso,
          forecastHorizon: horizon,
        });

        setChartData(data);
      } catch (err) {
        console.error('Failed to fetch chart data:', err);
        setError('Unable to load chart data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [startTime, endTime, horizon]);

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <header>
          <h1 className="dashboard-title">Wind Forecast Monitoring</h1>
          <p className="dashboard-subtitle">
            Compare actual and forecasted wind generation over time.
          </p>
        </header>

        <main className="dashboard-card">
          <DatePicker
            startTime={startTime}
            endTime={endTime}
            setStartTime={setStartTime}
            setEndTime={setEndTime}
          />

          <HorizonSlider horizon={horizon} setHorizon={setHorizon} />

          {loading && <div className="status-text">Loading chart data...</div>}

          {error && <div className="error-box">{error}</div>}

          {!loading && !error && <WindChart data={chartData} />}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;

