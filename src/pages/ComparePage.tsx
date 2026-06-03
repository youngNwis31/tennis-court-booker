import { useState } from "react";
import { courts } from "../data/courts";
import { useCourtReviews } from "../hooks/useReviews";
import { StarRating } from "../components/StarRating";
import { useWeather, getWeatherInfo } from "../hooks/useWeather";
import { Link } from "react-router-dom";
import type { Court } from "../types";

function CourtCompareCard({ court, onRemove }: { court: Court; onRemove: () => void }) {
  const { reviews, avgRating } = useCourtReviews(court.id);
  const { forecast } = useWeather(court.lat, court.lng);
  const todayWeather = forecast[0];
  const weatherInfo = todayWeather ? getWeatherInfo(todayWeather.weatherCode) : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className="text-4xl">{court.emoji}</div>
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-gray-600 text-sm"
        >
          ✕
        </button>
      </div>
      <h3 className="font-semibold text-gray-900">{court.name}</h3>
      <p className="text-sm text-gray-500 mt-1">{court.location}</p>

      <div className="mt-4 space-y-3 flex-1">
        {/* Price */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Price</span>
          <span className="font-semibold text-emerald-600">₱{court.hourlyRate}/hr</span>
        </div>

        {/* Surface */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Surface</span>
          <span className="text-sm font-medium capitalize">{court.surface}</span>
        </div>

        {/* Indoor/Outdoor */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Type</span>
          <span className="text-sm font-medium">{court.indoor ? "Indoor" : "Outdoor"}</span>
        </div>

        {/* Rating */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Rating</span>
          {reviews.length > 0 ? (
            <div className="flex items-center gap-1">
              <StarRating rating={Math.round(avgRating)} size="sm" />
              <span className="text-xs text-gray-400">({reviews.length})</span>
            </div>
          ) : (
            <span className="text-xs text-gray-400">No reviews</span>
          )}
        </div>

        {/* Weather */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Today</span>
          {weatherInfo ? (
            <span className="text-sm">
              {weatherInfo.emoji} {todayWeather!.tempMax}°C
            </span>
          ) : (
            <span className="text-xs text-gray-400">Loading...</span>
          )}
        </div>

        {/* Value score */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <span className="text-sm text-gray-500">AI Value Score</span>
          <span className="text-sm font-bold text-indigo-600">
            {calculateValueScore(court.hourlyRate, avgRating, court.indoor)}
          </span>
        </div>
      </div>

      <Link
        to={`/court/${court.id}`}
        className="mt-4 block text-center py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
      >
        Book this court
      </Link>
    </div>
  );
}

function calculateValueScore(price: number, rating: number, indoor: boolean): string {
  // Score based on rating/price ratio + indoor bonus
  let score = ((rating || 3) / price) * 100;
  if (indoor) score += 5;
  return Math.min(10, Math.round(score * 10) / 10).toFixed(1) + "/10";
}

export function ComparePage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const addCourt = (id: string) => {
    if (selectedIds.length < 3 && !selectedIds.includes(id)) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const removeCourt = (id: string) => {
    setSelectedIds(selectedIds.filter((s) => s !== id));
  };

  const availableCourts = courts.filter((c) => !selectedIds.includes(c.id));
  const selectedCourts = selectedIds.map((id) => courts.find((c) => c.id === id)!).filter(Boolean);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Compare Courts</h1>
      <p className="text-gray-500 mb-6">
        Select up to 3 courts to compare side by side — price, surface, rating, weather, and AI value score
      </p>

      {/* Court selector */}
      {selectedIds.length < 3 && (
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Add a court to compare ({3 - selectedIds.length} remaining):
          </p>
          <div className="flex flex-wrap gap-2">
            {availableCourts.map((court) => (
              <button
                key={court.id}
                onClick={() => addCourt(court.id)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm hover:bg-emerald-50 hover:border-emerald-300 transition-colors flex items-center gap-2"
              >
                <span>{court.emoji}</span>
                <span>{court.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Comparison grid */}
      {selectedCourts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-4">⚖️</p>
          <p>Select courts above to start comparing</p>
        </div>
      ) : (
        <div className={`grid gap-4 ${
          selectedCourts.length === 1
            ? "grid-cols-1 max-w-sm"
            : selectedCourts.length === 2
            ? "grid-cols-1 sm:grid-cols-2"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        }`}>
          {selectedCourts.map((court) => (
            <CourtCompareCard
              key={court.id}
              court={court}
              onRemove={() => removeCourt(court.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
