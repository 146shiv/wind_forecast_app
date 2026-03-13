import axios from 'axios';
import buildBestForecastMap from '../utils/forecastFilter.js';

async function fetchAndStoreActualData(req, res) {
  try {
    const { FUELHH_ENDPOINT } = process.env;

    if (!FUELHH_ENDPOINT) {
      return res.status(500).json({
        message: 'FUELHH_ENDPOINT is not configured in environment variables.',
      });
    }

    // Allow optional from/to override via query params, defaulting to a
    // reasonable recent window if not provided.
    const { from, to } = req.query;

    const response = await axios.get(FUELHH_ENDPOINT, {
      params: {
        from,
        to,
      },
      timeout: 30_000,
    });

    const records = Array.isArray(response.data)
      ? response.data
      : response.data?.data || [];

    const windRecords = records.filter(
      (item) =>
        item.fuelType === 'WIND' &&
        item.startTime &&
        item.generation != null,
    );

    if (windRecords.length === 0) {
      return res.status(200).json({
        message: 'No WIND records returned from API.',
        count: 0,
        data: [],
      });
    }

    return res.status(200).json({
      message: 'Actual WIND data fetched successfully.',
      count: windRecords.length,
      data: windRecords,
    });
  } catch (error) {
    console.error('Error fetching/storing actual WIND data:', error.message);
    return res.status(500).json({
      message: 'Failed to fetch/store actual WIND data.',
      error: error.message,
    });
  }
}

/**
 * Fetch forecast wind generation data and store it in MongoDB.
 *
 * This assumes the upstream API returns an array of records that include:
 *   startTime, publishTime, generation
 */
async function fetchAndStoreForecastData(req, res) {
  try {
    const { WINDFOR_ENDPOINT } = process.env;

    if (!WINDFOR_ENDPOINT) {
      return res.status(500).json({
        message: 'WINDFOR_ENDPOINT is not configured in environment variables.',
      });
    }

    const { from, to } = req.query;

    const response = await axios.get(WINDFOR_ENDPOINT, {
      params: {
        from,
        to,
      },
      timeout: 30_000,
    });

    const records = Array.isArray(response.data)
      ? response.data
      : response.data?.data || [];

    const cleanRecords = records.filter(
      (item) =>
        item.startTime &&
        item.publishTime &&
        item.generation != null
    );

    if (cleanRecords.length === 0) {
      return res.status(200).json({
        message: 'No forecast records returned from API.',
        count: 0,
        data: [],
      });
    }

    return res.status(200).json({
      message: 'Forecast WIND data fetched successfully.',
      count: cleanRecords.length,
      data: cleanRecords,
    });
  } catch (error) {
    console.error('Error fetching/storing forecast WIND data:', error.message);
    return res.status(500).json({
      message: 'Failed to fetch/store forecast WIND data.',
      error: error.message,
    });
  }
}

/**
 * Return merged chart data of actual vs forecast generation.
 *
 * Query parameters:
 *   startTime: ISO timestamp string
 *   endTime: ISO timestamp string
 *   forecastHorizon: number of hours (e.g. 1, 3, 24)
 */
async function getChartData(req, res) {
  try {
    const { startTime, endTime, forecastHorizon } = req.query;

    if (!startTime || !endTime || !forecastHorizon) {
      return res.status(400).json({
        message: 'Missing required query parameters: startTime, endTime, forecastHorizon.',
      });
    }

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    const horizonHours = Number(forecastHorizon);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return res.status(400).json({
        message: 'Invalid date format for startTime or endTime.',
      });
    }
    if (!Number.isFinite(horizonHours) || horizonHours < 0) {
      return res.status(400).json({
        message: 'forecastHorizon must be a non-negative number of hours.',
      });
    }

    if (startDate > endDate) {
      return res.status(400).json({
        message: 'startTime must be before endTime.',
      });
    }

    const windowStart = startDate;
    const windowEnd = endDate;

    const { FUELHH_ENDPOINT, WINDFOR_ENDPOINT } = process.env;

    if (!FUELHH_ENDPOINT || !WINDFOR_ENDPOINT) {
      return res.status(500).json({
        message:
          'FUELHH_ENDPOINT or WINDFOR_ENDPOINT is not configured in environment variables.',
      });
    }

    // Fetch raw data from external APIs for the requested window (no persistence).
    const [actualRes, forecastRes] = await Promise.all([
      axios.get(FUELHH_ENDPOINT, {
        params: {
          from: windowStart.toISOString(),
          to: windowEnd.toISOString(),
        },
        timeout: 30_000,
      }),
      axios.get(WINDFOR_ENDPOINT, {
        params: {
          from: windowStart.toISOString(),
          to: windowEnd.toISOString(),
        },
        timeout: 30_000,
      }),
    ]);

    const actualRaw = Array.isArray(actualRes.data)
      ? actualRes.data
      : actualRes.data?.data || [];

    const forecastRaw = Array.isArray(forecastRes.data)
      ? forecastRes.data
      : forecastRes.data?.data || [];

    const actuals = actualRaw
      .filter(
        (item) =>
          item.fuelType === 'WIND' &&
          item.startTime &&
          item.generation != null,
      )
      .map((item) => ({
        startTime: new Date(item.startTime),
        generation: Number(item.generation),
      }))
      .sort((a, b) => a.startTime - b.startTime);

    const forecasts = forecastRaw
      .filter(
        (item) =>
          item.startTime &&
          item.publishTime &&
          item.generation != null,
      )
      .map((item) => ({
        startTime: new Date(item.startTime),
        publishTime: new Date(item.publishTime),
        generation: Number(item.generation),
      }))
      .sort((a, b) => {
        if (a.startTime.getTime() === b.startTime.getTime()) {
          return a.publishTime - b.publishTime;
        }
        return a.startTime - b.startTime;
      });

    const targetStartTimes = actuals.map((a) => a.startTime);

    const forecastMap = buildBestForecastMap(
      targetStartTimes,
      forecasts,
      horizonHours
    );

    const merged = actuals.map((a) => {
      const key = new Date(a.startTime).getTime();
      const bestForecast = forecastMap.get(key);

      return {
        time: a.startTime.toISOString(),
        actual: a.generation,
        forecast: bestForecast ? bestForecast.generation : null,
      };
    });

    // Debug logging for horizon behaviour and merged series
    console.log('[/api/v1/wind/chart] Params:', {
      startTime: windowStart.toISOString(),
      endTime: windowEnd.toISOString(),
      forecastHorizonHours: horizonHours,
    });
    console.log('[/api/v1/wind/chart] Counts:', {
      actualCount: actuals.length,
      forecastCount: forecasts.length,
      mergedCount: merged.length,
    });
    console.log(
      '[/api/v1/wind/chart] Sample merged points:',
      merged.slice(0, 5),
    );

    return res.status(200).json(merged);
  } catch (error) {
    console.error('Error building chart data:', error.message);
    return res.status(500).json({
      message: 'Failed to build chart data.',
      error: error.message,
    });
  }
}



const windController = {
  fetchAndStoreActualData,
  fetchAndStoreForecastData,
  getChartData,
};

export default windController;


