

 
function buildBestForecastMap(targetStartTimes, forecasts, forecastHorizonHours) {
  if (!Array.isArray(targetStartTimes) || !Array.isArray(forecasts)) {
    throw new Error('targetStartTimes and forecasts must be arrays');
  }

  const horizonMs = forecastHorizonHours * 60 * 60 * 1000;

  // Group forecasts by their startTime (millisecond key) for efficient lookup.
  const forecastsByStartTime = new Map();
  for (const forecast of forecasts) {
    if (!forecast.startTime || !forecast.publishTime) continue;

    const key = new Date(forecast.startTime).getTime();
    if (!forecastsByStartTime.has(key)) {
      forecastsByStartTime.set(key, []);
    }
    forecastsByStartTime.get(key).push(forecast);
  }

  const result = new Map();

  for (const targetStart of targetStartTimes) {
    const targetKey = new Date(targetStart).getTime();
    const limitTimeMs = targetKey - horizonMs;

    const candidates = forecastsByStartTime.get(targetKey);
    if (!candidates || candidates.length === 0) {
      continue;
    }

    // From all forecasts for this start time, pick the latest publishTime
    // that is still earlier than or equal to limitTime. If no such forecast
    // exists (e.g. only forecasts created after the target time), fall back
    // to the latest forecast for this start time so that the UI can still
    // display a comparison line.
    let best = null;
    let bestPublishTimeMs = -Infinity;

    for (const f of candidates) {
      const publishMs = new Date(f.publishTime).getTime();
      if (publishMs <= limitTimeMs && publishMs > bestPublishTimeMs) {
        best = f;
        bestPublishTimeMs = publishMs;
      }
    }

    // Fallback: if horizon filter removed all candidates, use the latest
    // available forecast for this start time.
    if (!best) {
      for (const f of candidates) {
        const publishMs = new Date(f.publishTime).getTime();
        if (publishMs > bestPublishTimeMs) {
          best = f;
          bestPublishTimeMs = publishMs;
        }
      }
    }

    if (best) {
      result.set(targetKey, best);
    }
  }

  return result;
}

export default buildBestForecastMap;

