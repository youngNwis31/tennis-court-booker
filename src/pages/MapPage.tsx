import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import { courts } from "../data/courts";
import { useCourtReviews } from "../hooks/useReviews";
import { StarRating } from "../components/StarRating";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon issue with bundlers
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

// Center map on average of all court positions
const center: [number, number] = [
  courts.reduce((s, c) => s + c.lat, 0) / courts.length,
  courts.reduce((s, c) => s + c.lng, 0) / courts.length,
];

function CourtPopup({ courtId }: { courtId: string }) {
  const court = courts.find((c) => c.id === courtId)!;
  const { reviews, avgRating } = useCourtReviews(courtId);

  return (
    <div className="min-w-[200px]">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">{court.emoji}</span>
        <span className="font-semibold text-gray-900 text-sm">{court.name}</span>
      </div>
      <p className="text-xs text-gray-500 mb-2">{court.location}</p>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 capitalize">
          {court.surface}
        </span>
        {court.indoor && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
            indoor
          </span>
        )}
        <span className="text-xs font-semibold text-emerald-600 ml-auto">
          ${court.hourlyRate}/hr
        </span>
      </div>
      {reviews.length > 0 && (
        <div className="flex items-center gap-1 mb-2">
          <StarRating rating={Math.round(avgRating)} size="sm" />
          <span className="text-xs text-gray-400">({reviews.length})</span>
        </div>
      )}
      <Link
        to={`/court/${court.id}`}
        className="block text-center py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors"
      >
        View & Book
      </Link>
    </div>
  );
}

export function MapPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Court Map</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Find tennis courts near you — click a pin to see details and book
      </p>

      <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700" style={{ height: "500px" }}>
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {courts.map((court) => (
            <Marker key={court.id} position={[court.lat, court.lng]}>
              <Popup>
                <CourtPopup courtId={court.id} />
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Court list below map */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {courts.map((court) => (
          <Link
            key={court.id}
            to={`/court/${court.id}`}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 flex items-center gap-3 hover:shadow-md transition-shadow"
          >
            <span className="text-2xl">{court.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{court.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{court.surface} • ${court.hourlyRate}/hr</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
