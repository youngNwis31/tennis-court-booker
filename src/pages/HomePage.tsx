import { useState, useEffect } from "react";
import { courts } from "../data/courts";
import { CourtCard } from "../components/CourtCard";
import type { Court } from "../types";
import { SmartRecommendations } from "../components/SmartRecommendations";

const SURFACES: Array<Court["surface"] | "all"> = ["all", "hard", "clay", "grass"];
const CITIES = ["all", ...Array.from(new Set(courts.map((c) => c.city))).sort()];

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

type SortOption = "default" | "price-low" | "price-high" | "nearest";

export function HomePage() {
  const [search, setSearch] = useState("");
  const [surface, setSurface] = useState<Court["surface"] | "all">("all");
  const [city, setCity] = useState("all");
  const [sort, setSort] = useState<SortOption>("default");
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);

  // Get user location
  useEffect(() => {
    if ("geolocation" in navigator) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLat(pos.coords.latitude);
          setUserLng(pos.coords.longitude);
          setLocating(false);
        },
        () => setLocating(false),
        { timeout: 5000 }
      );
    }
  }, []);

  const getDistance = (court: Court): number | null => {
    if (userLat == null || userLng == null) return null;
    return haversineDistance(userLat, userLng, court.lat, court.lng);
  };

  let filtered = courts.filter((c) => {
    const matchesSurface = surface === "all" || c.surface === surface;
    const matchesCity = city === "all" || c.city === city;
    const matchesSearch =
      search === "" ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase());
    return matchesSurface && matchesCity && matchesSearch;
  });

  // Sort
  if (sort === "price-low") {
    filtered = [...filtered].sort((a, b) => a.hourlyRate - b.hourlyRate);
  } else if (sort === "price-high") {
    filtered = [...filtered].sort((a, b) => b.hourlyRate - a.hourlyRate);
  } else if (sort === "nearest" && userLat != null) {
    filtered = [...filtered].sort((a, b) => (getDistance(a) ?? 999) - (getDistance(b) ?? 999));
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-r from-emerald-600 to-teal-500 p-8 md:p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-8 text-[120px] leading-none">🎾</div>
          <div className="absolute bottom-2 left-12 text-[80px] leading-none">🏟️</div>
        </div>
        <div className="relative">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Find Your Perfect Court
          </h1>
          <p className="text-emerald-100 mt-2 text-lg">
            {courts.length} tennis courts across Metro Manila — book in seconds
          </p>
          <div className="flex flex-wrap gap-3 mt-4 text-sm text-white/80">
            <span>🏙️ {CITIES.length - 1} cities</span>
            <span>•</span>
            <span>🏢 {courts.filter(c => c.indoor).length} indoor courts</span>
            <span>•</span>
            <span>💰 From ₱{Math.min(...courts.map(c => c.hourlyRate))}/hr</span>
          </div>
        </div>
      </div>

      <SmartRecommendations />

      {/* Search + Filters */}
      <div className="space-y-4 mb-6">
        <input
          type="text"
          placeholder="Search by name, location, or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />

        <div className="flex flex-wrap gap-2 items-center">
          {/* Surface filter */}
          {SURFACES.map((s) => (
            <button
              key={s}
              onClick={() => setSurface(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                surface === s
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {s}
            </button>
          ))}

          <span className="text-gray-300 dark:text-gray-600">|</span>

          {/* City filter */}
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All Cities" : c}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="default">Sort: Default</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="nearest" disabled={userLat == null}>
              {locating ? "Getting location..." : userLat != null ? "Nearest First" : "Nearest (allow location)"}
            </option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-400 mb-4">
        {filtered.length} court{filtered.length !== 1 ? "s" : ""} found
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-4">🔍</p>
          <p>No courts match your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((court) => (
            <CourtCard key={court.id} court={court} distance={getDistance(court)} />
          ))}
        </div>
      )}
    </div>
  );
}
