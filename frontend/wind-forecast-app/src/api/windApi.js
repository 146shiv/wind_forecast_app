import axios from 'axios';

// In dev, Vite proxies /api to the backend; use same origin so proxy is used.
const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? '' : 'http://localhost:5000');

const apiClient = axios.create({
  baseURL,
  timeout: 30000,
});

export async function fetchWindChartData({ startTime, endTime, forecastHorizon }) {
  const response = await apiClient.get('/api/v1/wind/chart', {
    params: {
      startTime,
      endTime,
      forecastHorizon,
    },
  });

  return response.data || [];
}

export default apiClient;

