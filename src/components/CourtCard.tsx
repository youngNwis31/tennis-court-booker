import { Link } from "react-router-dom";
import type { Court } from "../types";
import { useCourtReviews } from "../hooks/useReviews";
import { StarRating } from "./StarRating";

const surfaceColors: Record<Court["surface"], string> = {
  hard: "bg-blue-100 text-blue-700",
  clay: "bg-orange-100 text-orange-700",
  grass: "bg-green-100 text-green-700",
};

interface Props {
  court: Court;
  distance?: number | null;
}

export function CourtCard({ court, distance }: Props) {
  const { reviews, avgRating } = useCourtReviews(court.id);

  return (
    <Link
      to={`/court/${court.id}`}
      className="block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
    >
      {court.photos.length > 0 ? (
        <img
          src={court.photos[0]}
          alt={court.name}
          className="w-full h-36 object-cover"
        />
      ) : (
        <div className="h-36 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-6xl">
          {court.emoji}
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{court.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{court.location}</p>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${surfaceColors[court.surface]}`}
          >
            {court.surface}
          </span>
          {court.indoor && (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-700">
              indoor
            </span>
          )}
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            {court.city}
          </span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <p className="text-emerald-600 font-semibold">
            ₱{court.hourlyRate}/hr
          </p>
          <div className="flex items-center gap-2">
            {distance != null && (
              <span className="text-xs text-gray-400">
                📍 {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}
              </span>
            )}
            {reviews.length > 0 && (
              <div className="flex items-center gap-1">
                <StarRating rating={Math.round(avgRating)} size="sm" />
                <span className="text-xs text-gray-400">({reviews.length})</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
