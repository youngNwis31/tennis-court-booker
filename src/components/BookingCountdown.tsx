import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUserBookings } from "../hooks/useBookings";
import { useAuth } from "../context/AuthContext";
import { courts } from "../data/courts";

function formatHour(h: number): string {
  const suffix = h >= 12 ? "PM" : "AM";
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${display}:00 ${suffix}`;
}

export function BookingCountdown() {
  const { user } = useAuth();
  const { bookings } = useUserBookings();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!user || bookings.length === 0) return null;

  // Find next upcoming booking
  const today = now.toISOString().split("T")[0];
  const currentHour = now.getHours();

  const upcoming = bookings
    .filter((b) => {
      if (b.date > today) return true;
      if (b.date === today && b.start_hour > currentHour) return true;
      return false;
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.start_hour - b.start_hour);

  if (upcoming.length === 0) return null;

  const next = upcoming[0];
  const court = courts.find((c) => c.id === next.court_id);
  const bookingTime = new Date(`${next.date}T${String(next.start_hour).padStart(2, "0")}:00:00`);
  const diff = bookingTime.getTime() - now.getTime();

  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const isAlmostTime = diff <= 60 * 60 * 1000; // Less than 1 hour

  return (
    <div className={`rounded-2xl p-4 mb-6 ${
      isAlmostTime
        ? "bg-gradient-to-r from-orange-500 to-red-500 animate-pulse"
        : "bg-gradient-to-r from-emerald-500 to-teal-500"
    } text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-white/80">
            {isAlmostTime ? "⏰ Almost time!" : "⏳ Next booking in"}
          </p>
          <div className="flex items-baseline gap-1 mt-1">
            {days > 0 && (
              <>
                <span className="text-2xl font-black">{days}</span>
                <span className="text-xs text-white/70 mr-2">d</span>
              </>
            )}
            <span className="text-2xl font-black">{String(hours).padStart(2, "0")}</span>
            <span className="text-xs text-white/70">h</span>
            <span className="text-2xl font-black">{String(minutes).padStart(2, "0")}</span>
            <span className="text-xs text-white/70">m</span>
            <span className="text-2xl font-black">{String(seconds).padStart(2, "0")}</span>
            <span className="text-xs text-white/70">s</span>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-sm">{court?.name}</p>
          <p className="text-xs text-white/80">{formatHour(next.start_hour)}</p>
          <Link
            to={`/court/${next.court_id}`}
            className="text-xs text-white/90 hover:text-white underline"
          >
            View court →
          </Link>
        </div>
      </div>
    </div>
  );
}
