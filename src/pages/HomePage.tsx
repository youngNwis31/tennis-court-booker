import { useState } from "react";
import { courts } from "../data/courts";
import { CourtCard } from "../components/CourtCard";
import type { Court } from "../types";

const SURFACES: Array<Court["surface"] | "all"> = ["all", "hard", "clay", "grass"];

export function HomePage() {
  const [search, setSearch] = useState("");
  const [surface, setSurface] = useState<Court["surface"] | "all">("all");

  const filtered = courts.filter((c) => {
    const matchesSurface = surface === "all" || c.surface === surface;
    const matchesSearch =
      search === "" ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase());
    return matchesSurface && matchesSearch;
  });

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Find a Court</h1>
        <p className="text-gray-500 mt-2">
          Browse available tennis courts and book your next session
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        <div className="flex gap-2">
          {SURFACES.map((s) => (
            <button
              key={s}
              onClick={() => setSurface(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                surface === s
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-4">🔍</p>
          <p>No courts match your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((court) => (
            <CourtCard key={court.id} court={court} />
          ))}
        </div>
      )}
    </div>
  );
}
