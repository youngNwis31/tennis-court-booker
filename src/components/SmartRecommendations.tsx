import { Link } from "react-router-dom";
import { useUserBookings } from "../hooks/useBookings";
import { useRecommendations } from "../hooks/useRecommendations";
import { useAuth } from "../context/AuthContext";

export function SmartRecommendations() {
  const { user } = useAuth();
  const { bookings, loading } = useUserBookings();
  const recommendations = useRecommendations(bookings);

  if (!user || loading || recommendations.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <span>🤖</span> Recommended for You
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Based on your {bookings.length} bookings
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {recommendations.map((rec, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <p className="text-2xl mb-2">{rec.emoji}</p>
            <p className="font-semibold text-gray-900 text-sm">{rec.title}</p>
            <p className="text-xs text-gray-500 mt-1">{rec.description}</p>
            {rec.link && (
              <Link
                to={rec.link}
                className="inline-block mt-3 text-xs font-medium text-emerald-600 hover:underline"
              >
                Book now →
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
