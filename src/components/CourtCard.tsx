import { Link } from "react-router-dom";
import type { Court } from "../types";
import { useCourtReviews } from "../hooks/useReviews";
import { StarRating } from "./StarRating";
import { FavoriteButton } from "./FavoriteButton";

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
      className="group block bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* Photo with satellite overlay */}
      <div className="relative h-44 overflow-hidden">
        {/* Main photo */}
        <img
          src={court.photos[0]}
          alt={court.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Price badge + Favorite */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <FavoriteButton courtId={court.id} />
          <div className="px-3 py-1 rounded-full bg-emerald-500 text-white text-sm font-bold shadow-lg">
            ₱{court.hourlyRate}/hr
          </div>
        </div>

        {/* Indoor badge */}
        {court.indoor && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-purple-500 text-white text-xs font-medium">
            Indoor
          </div>
        )}

        {/* Court name on photo */}
        <div className="absolute bottom-3 left-3 right-20">
          <h3 className="font-bold text-white text-lg drop-shadow-lg leading-tight">{court.name}</h3>
          <p className="text-white/80 text-sm mt-0.5">{court.location}</p>
        </div>
      </div>

      {/* Info section */}
      <div className="p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${surfaceColors[court.surface]}`}>
            {court.surface}
          </span>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            📍 {court.city}
          </span>
          {distance != null && (
            <span className="text-xs text-gray-400 ml-auto">
              {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`} away
            </span>
          )}
        </div>

        {reviews.length > 0 && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <StarRating rating={Math.round(avgRating)} size="sm" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{avgRating.toFixed(1)}</span>
            <span className="text-xs text-gray-400">({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
          </div>
        )}
      </div>
    </Link>
  );
}
