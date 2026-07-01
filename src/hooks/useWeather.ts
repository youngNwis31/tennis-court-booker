import { useState, useEffect } from "react";
import type { DayForecast } from "../types";
import { fetchForecast, getWeatherInfo, isRainy } from "../services/weather";

export { getWeatherInfo, isRainy };

export function useWeather(lat: number, lng: number) {
  const [forecast, setForecast] = useState<DayForecast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForecast(lat, lng)
      .then(setForecast)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lat, lng]);

  return { forecast, loading };
}
