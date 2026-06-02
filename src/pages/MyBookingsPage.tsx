import { Link } from "react-router-dom";
import { useUserBookings, useBookingActions } from "../hooks/useBookings";
import { courts } from "../data/courts";

function formatHour(h: number): string {
  const suffix = h >= 12 ? "PM" : "AM";
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${display}:00 ${suffix}`;
}

export function MyBookingsPage() {
  const { bookings, loading, refresh } = useUserBookings();
  const { cancelBooking } = useBookingActions();

  const today = new Date().toISOString().split("T")[0];
  const upcoming = bookings.filter((b) => b.date >= today);
  const past = bookings.filter((b) => b.date < today);

  const handleCancel = async (id: string) => {
    await cancelBooking(id);
    await refresh();
  };

  if (loading) {
    return (
      <div className="text-center py-16 text-gray-400">Loading bookings...</div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-4">📅</p>
          <p className="mb-4">No bookings yet</p>
          <Link to="/" className="text-emerald-600 hover:underline">
            Browse courts
          </Link>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Upcoming</h2>
              <div className="space-y-3">
                {upcoming.map((booking) => {
                  const court = courts.find((c) => c.id === booking.court_id);
                  return (
                    <div
                      key={booking.id}
                      className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4"
                    >
                      <div className="text-3xl">{court?.emoji ?? "🎾"}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">
                          {court?.name ?? "Unknown Court"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(booking.date + "T00:00").toLocaleDateString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          at {formatHour(booking.start_hour)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Past</h2>
              <div className="space-y-3 opacity-60">
                {past.map((booking) => {
                  const court = courts.find((c) => c.id === booking.court_id);
                  return (
                    <div
                      key={booking.id}
                      className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4"
                    >
                      <div className="text-3xl">{court?.emoji ?? "🎾"}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">
                          {court?.name ?? "Unknown Court"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(booking.date + "T00:00").toLocaleDateString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          at {formatHour(booking.start_hour)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
