import { useFavorites } from "../hooks/useFavorites";

export function FavoriteButton({ courtId }: { courtId: string }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const faved = isFavorite(courtId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(courtId);
      }}
      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md ${
        faved
          ? "bg-red-500 text-white scale-110"
          : "bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white"
      }`}
      title={faved ? "Remove from favorites" : "Add to favorites"}
    >
      {faved ? "❤️" : "🤍"}
    </button>
  );
}
