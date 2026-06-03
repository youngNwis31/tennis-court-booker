import { getSatelliteImageUrl } from "../lib/satellite";
import type { Court } from "../types";

interface Props {
  court: Court;
}

export function SatelliteView({ court }: Props) {
  const closeUp = getSatelliteImageUrl(court.lat, court.lng, 18);
  const medium = getSatelliteImageUrl(court.lat, court.lng, 17);
  const wider = getSatelliteImageUrl(court.lat, court.lng, 16);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-6">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
        <span>🛰️</span> Real Satellite View
      </h3>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
        Actual satellite imagery of {court.name} — see the real court from above
      </p>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 aspect-square">
            <img
              src={closeUp}
              alt={`${court.name} close-up satellite view`}
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
            />
          </div>
          <p className="text-[10px] text-gray-400 text-center">Close-up View</p>
        </div>
        <div className="space-y-1.5">
          <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 aspect-square">
            <img
              src={medium}
              alt={`${court.name} medium satellite view`}
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
            />
          </div>
          <p className="text-[10px] text-gray-400 text-center">Court Area</p>
        </div>
        <div className="space-y-1.5">
          <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 aspect-square">
            <img
              src={wider}
              alt={`${court.name} neighborhood view`}
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
            />
          </div>
          <p className="text-[10px] text-gray-400 text-center">Neighborhood</p>
        </div>
      </div>

      <a
        href={`https://www.google.com/maps?q=${court.lat},${court.lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
      >
        🗺️ Open in Google Maps
      </a>
    </div>
  );
}
