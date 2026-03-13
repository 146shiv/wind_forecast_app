import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import dayjs from 'dayjs';

function WindChart({ data }) {
  const safeData = Array.isArray(data) ? data : [];

  const formattedData = safeData.map((point) => ({
    ...point,
    timeLabel: dayjs(point.time).format('YYYY-MM-DD HH:mm'),
  }));

  return (
    <div className="chart-wrapper">
      <LineChart
        width={800}
        height={320}
        data={formattedData}
        margin={{ top: 10, right: 20, bottom: 10, left: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="timeLabel"
          tick={{ fontSize: 12 }}
          minTickGap={20}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          label={{
            value: 'Power (MW)',
            angle: -90,
            position: 'insideLeft',
            offset: -5,
            style: { fontSize: 12 },
          }}
        />
        <Tooltip
          formatter={(value, name) => [
            value,
            name === 'actual' ? 'Actual Generation' : 'Forecast Generation',
          ]}
          labelFormatter={(label) => `Time: ${label}`}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="actual"
          name="Actual Generation"
          stroke="#2563eb"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 5 }}
          connectNulls={false}
        />
        <Line
          type="monotone"
          dataKey="forecast"
          name="Forecast Generation"
          stroke="#16a34a"
          strokeWidth={2.5}
          strokeDasharray="6 4"
          dot={false}
          activeDot={{ r: 5 }}
          connectNulls={false}
        />
      </LineChart>
    </div>
  );
}

export default WindChart;

