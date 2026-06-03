import { useState, useEffect } from "react";

export interface DayForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  precipProbability: number;
}

const weatherDescriptions: Record<number, { label: string; emoji: string }> = {
  0: { label: "Clear sky", emoji: "☀️" },
  1: { label: "Mostly clear", emoji: "🌤️" },
  2: { label: "Partly cloudy", emoji: "⛅" },
  3: { label: "Overcast", emoji: "☁️" },
  45: { label: "Foggy", emoji: "🌫️" },
  48: { label: "Icy fog", emoji: "🌫️" },
  51: { label: "Light drizzle", emoji: "🌦️" },
  53: { label: "Drizzle", emoji: "🌦️" },
  55: { label: "Heavy drizzle", emoji: "🌧️" },
  61: { label: "Light rain", emoji: "🌧️" },
  63: { label: "Rain", emoji: "🌧️" },
  65: { label: "Heavy rain", emoji: "🌧️" },
  71: { label: "Light snow", emoji: "🌨️" },
  73: { label: "Snow", emoji: "❄️" },
  75: { label: "Heavy snow", emoji: "❄️" },
  80: { label: "Rain showers", emoji: "🌧️" },
  81: { label: "Heavy showers", emoji: "🌧️" },
  82: { label: "Violent showers", emoji: "⛈️" },
  95: { label: "Thunderstorm", emoji: "⛈️" },
  96: { label: "Thunderstorm + hail", emoji: "⛈️" },
  99: { label: "Severe thunderstorm", emoji: "⛈️" },
};

export function getWeatherInfo(code: number) {
  return weatherDescriptions[code] ?? { label: "Unknown", emoji: "🌡️" };
}

export function isRainy(code: number) {
  return code >= 51;
}

export function useWeather(lat: number, lng: number) {
  const [forecast, setForecast] = useState<DayForecast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&timezone=auto&forecast_days=3&temperature_unit=fahrenheit`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const days: DayForecast[] = data.daily.time.map(
          (date: string, i: number) => ({
            date,
            tempMax: Math.round(data.daily.temperature_2m_max[i]),
            tempMin: Math.round(data.daily.temperature_2m_min[i]),
            weatherCode: data.daily.weather_code[i],
            precipProbability: data.daily.precipitation_probability_max[i],
          })
        );
        setForecast(days);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [lat, lng]);

  return { forecast, loading };
}
