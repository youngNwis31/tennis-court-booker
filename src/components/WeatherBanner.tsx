import { useWeather, getWeatherInfo, isRainy } from "../hooks/useWeather";
import { courts } from "../data/courts";
import { Link } from "react-router-dom";
import type { Court } from "../types";

interface Props {
  court: Court;
}

export function WeatherBanner({ court }: Props) {
  const { forecast, loading } = useWeather(court.lat, court.lng);

  if (loading) return null;
  if (forecast.length === 0) return null;

  const hasRain = forecast.some((d) => isRainy(d.weatherCode));
  const indoorAlternatives = courts.filter(
    (c) => c.indoor && c.id !== court.id
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <span>🌤️</span> 3-Day Weather Forecast
      </h3>

      <div className="grid grid-cols-3 gap-3">
        {forecast.map((day) => {
          const info = getWeatherInfo(day.weatherCode);
          const rainy = isRainy(day.weatherCode);
          const dateLabel = new Date(day.date + "T00:00").toLocaleDateString(
            undefined,
            { weekday: "short", month: "short", day: "numeric" }
          );
          return (
            <div
              key={day.date}
              className={`rounded-lg p-3 text-center ${
                rainy ? "bg-blue-50 border border-blue-200" : "bg-gray-50"
              }`}
            >
              <p className="text-xs text-gray-500">{dateLabel}</p>
              <p className="text-2xl my-1">{info.emoji}</p>
              <p className="text-xs font-medium text-gray-700">{info.label}</p>
              <p className="text-xs text-gray-500 mt-1">
                {day.tempMin}° – {day.tempMax}°C
              </p>
              {day.precipProbability > 0 && (
                <p className="text-xs text-blue-600 mt-1">
                  💧 {day.precipProbability}% rain
                </p>
              )}
            </div>
          );
        })}
      </div>

      {hasRain && !court.indoor && indoorAlternatives.length > 0 && (
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-amber-800 font-medium">
            🌧️ Rain expected — consider an indoor court instead:
          </p>
          <div className="flex gap-2 mt-2">
            {indoorAlternatives.map((c) => (
              <Link
                key={c.id}
                to={`/court/${c.id}`}
                className="text-sm px-3 py-1.5 bg-white rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors"
              >
                {c.emoji} {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
