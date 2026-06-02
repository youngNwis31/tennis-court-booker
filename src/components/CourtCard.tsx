import { Link } from "react-router-dom";
import type { Court } from "../types";

const surfaceColors: Record<Court["surface"], string> = {
  hard: "bg-blue-100 text-blue-700",
  clay: "bg-orange-100 text-orange-700",
  grass: "bg-green-100 text-green-700",
};

export function CourtCard({ court }: { court: Court }) {
  return (
    <Link
      to={`/court/${court.id}`}
      className="block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="h-36 bg-gray-100 flex items-center justify-center text-6xl">
        {court.emoji}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-lg">{court.name}</h3>
        <p className="text-sm text-gray-500 mt-1">{court.location}</p>
        <div className="flex items-center gap-2 mt-3">
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
        </div>
        <p className="text-emerald-600 font-semibold mt-3">
          ${court.hourlyRate}/hr
        </p>
      </div>
    </Link>
  );
}
