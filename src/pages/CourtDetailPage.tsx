import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { courts } from "../data/courts";
import { useCourtBookings, useBookingActions } from "../hooks/useBookings";
import { useAuth } from "../context/AuthContext";
import { TimeSlotPicker } from "../components/TimeSlotPicker";
import { WeatherBanner } from "../components/WeatherBanner";
import { ReviewSection } from "../components/ReviewSection";
import { AvailabilityHeatmap } from "../components/AvailabilityHeatmap";
import { PhotoGallery } from "../components/PhotoGallery";
import { useToast } from "../components/Toast";

export function CourtDetailPage() {
  const { id } = useParams<{ id: string }>();
  const court = courts.find((c) => c.id === id);
  const { user } = useAuth();
  const { showToast } = useToast();

  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { isSlotBooked, loading, refresh } = useCourtBookings(id ?? "", date);
  const { addBooking } = useBookingActions();

  if (!court) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-4">😕</p>
        <p className="text-gray-500">Court not found</p>
        <Link to="/" className="text-emerald-600 hover:underline mt-4 inline-block">
          Back to courts
        </Link>
      </div>
    );
  }

  const handleBook = async () => {
    if (selectedHour === null) return;
    setSubmitting(true);
    setError(null);
    const { error } = await addBooking(court.id, date, selectedHour);
    if (error) {
      setError(error);
      showToast(error, "error");
    } else {
      setConfirmed(true);
      setSelectedHour(null);
      showToast("Booking confirmed! 🎾", "success");
      await refresh();
    }
    setSubmitting(false);
  };

  return (
    <div>
      <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-flex items-center gap-1">
        ← Back to courts
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
        {court.photos.length > 0 ? (
          <PhotoGallery photos={court.photos} alt={court.name} />
        ) : (
          <div className="h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-8xl">
            {court.emoji}
          </div>
        )}
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">{court.name}</h1>
          <p className="text-gray-500 mt-1">{court.location}</p>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700 capitalize">
              {court.surface}
            </span>
            {court.indoor && (
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                indoor
              </span>
            )}
            <span className="text-emerald-600 font-semibold ml-auto text-lg">
              ₱{court.hourlyRate}/hr
            </span>
          </div>
        </div>
      </div>

      <WeatherBanner court={court} />
      <AvailabilityHeatmap courtId={court.id} />

      {confirmed && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <p className="text-emerald-800 font-medium">
            Booking confirmed! Check{" "}
            <Link to="/bookings" className="underline">
              My Bookings
            </Link>{" "}
            to view it.
          </p>
          <button onClick={() => setConfirmed(false)} className="text-emerald-600 hover:text-emerald-800">
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Book a Session</h2>

        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Date
        </label>
        <input
          type="date"
          value={date}
          min={today}
          onChange={(e) => {
            setDate(e.target.value);
            setSelectedHour(null);
            setConfirmed(false);
            setError(null);
          }}
          className="mb-6 px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        <label className="block text-sm font-medium text-gray-700 mb-2">
          Available Time Slots
        </label>
        {loading ? (
          <p className="text-gray-400 text-sm py-4">Loading slots...</p>
        ) : (
          <TimeSlotPicker
            selectedHour={selectedHour}
            onSelect={setSelectedHour}
            isSlotBooked={isSlotBooked}
          />
        )}

        {selectedHour !== null && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            {user ? (
              <button
                onClick={handleBook}
                disabled={submitting}
                className="w-full py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? "Booking..." : "Confirm Booking"}
              </button>
            ) : (
              <div className="text-center">
                <p className="text-gray-500 mb-3">Sign in to book this slot</p>
                <Link
                  to="/auth"
                  className="inline-block px-6 py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      <ReviewSection courtId={court.id} />
    </div>
  );
}
