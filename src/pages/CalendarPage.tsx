import { useState } from "react";
import { Link } from "react-router-dom";
import { useUserBookings } from "../hooks/useBookings";
import { courts } from "../data/courts";

function formatHour(h: number): string {
  const suffix = h >= 12 ? "PM" : "AM";
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${display}:00 ${suffix}`;
}

const courtColors = [
  "bg-emerald-500", "bg-blue-500", "bg-purple-500", "bg-orange-500",
  "bg-pink-500", "bg-teal-500", "bg-indigo-500", "bg-rose-500",
  "bg-cyan-500", "bg-amber-500", "bg-lime-500", "bg-fuchsia-500",
  "bg-sky-500", "bg-violet-500", "bg-red-500", "bg-green-500",
  "bg-yellow-500", "bg-slate-500",
];

export function CalendarPage() {
  const { bookings } = useUserBookings();
  const [weekOffset, setWeekOffset] = useState(0);

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1 + weekOffset * 7); // Monday

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const getBookingsForDay = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return bookings
      .filter((b) => b.date === dateStr)
      .sort((a, b) => a.start_hour - b.start_hour);
  };

  const isToday = (date: Date) => {
    return date.toISOString().split("T")[0] === today.toISOString().split("T")[0];
  };

  const weekLabel = `${days[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })} — ${days[6].toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Booking Calendar</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">View your bookings at a glance</p>

      {/* Week navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setWeekOffset((w) => w - 1)}
          className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          ← Previous
        </button>
        <div className="text-center">
          <p className="font-semibold text-gray-900 dark:text-white">{weekLabel}</p>
          {weekOffset !== 0 && (
            <button onClick={() => setWeekOffset(0)} className="text-xs text-emerald-600 hover:underline">
              Back to this week
            </button>
          )}
        </div>
        <button
          onClick={() => setWeekOffset((w) => w + 1)}
          className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Next →
        </button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((date) => {
          const dayBookings = getBookingsForDay(date);
          const dateIsToday = isToday(date);
          return (
            <div
              key={date.toISOString()}
              className={`min-h-[160px] rounded-xl border p-3 ${
                dateIsToday
                  ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {date.toLocaleDateString(undefined, { weekday: "short" })}
                </span>
                <span
                  className={`text-sm font-bold ${
                    dateIsToday ? "text-emerald-600" : "text-gray-900 dark:text-white"
                  }`}
                >
                  {date.getDate()}
                </span>
              </div>

              {dayBookings.length === 0 ? (
                <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-4 text-center">No bookings</p>
              ) : (
                <div className="space-y-1.5">
                  {dayBookings.map((booking) => {
                    const court = courts.find((c) => c.id === booking.court_id);
                    const colorIdx = courts.findIndex((c) => c.id === booking.court_id);
                    return (
                      <Link
                        key={booking.id}
                        to={`/court/${booking.court_id}`}
                        className={`block px-2 py-1.5 rounded-lg text-white text-[10px] font-medium truncate ${courtColors[colorIdx % courtColors.length]} hover:opacity-80 transition-opacity`}
                      >
                        {formatHour(booking.start_hour)}
                        <br />
                        <span className="opacity-80">{court?.name?.split(" ").slice(0, 2).join(" ")}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      {bookings.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {Array.from(new Set(bookings.map((b) => b.court_id))).map((courtId) => {
            const court = courts.find((c) => c.id === courtId);
            const colorIdx = courts.findIndex((c) => c.id === courtId);
            return (
              <div key={courtId} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-sm ${courtColors[colorIdx % courtColors.length]}`} />
                <span className="text-xs text-gray-500 dark:text-gray-400">{court?.name}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
