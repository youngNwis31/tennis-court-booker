import { courts } from "../data/courts";
import { useFavorites } from "../hooks/useFavorites";
import { CourtCard } from "../components/CourtCard";
import { Link } from "react-router-dom";

export function FavoritesPage() {
  const { favorites } = useFavorites();
  const favoriteCourts = courts.filter((c) => favorites.includes(c.id));

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Favorites</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Courts you've saved — tap the heart on any court to add it here
      </p>

      {favoriteCourts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-4">💚</p>
          <p className="mb-4">No favorites yet</p>
          <Link to="/" className="text-emerald-600 hover:underline">Browse courts</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteCourts.map((court) => (
            <CourtCard key={court.id} court={court} />
          ))}
        </div>
      )}
    </div>
  );
}
