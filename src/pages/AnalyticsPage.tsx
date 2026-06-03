import { useUserBookings } from "../hooks/useBookings";
import { useAuth } from "../context/AuthContext";
import { courts } from "../data/courts";
import { calculateBadges, BadgeGrid } from "../components/Achievements";
import { StreakDisplay } from "../components/StreakTracker";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Review } from "../types";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function BarChart({ data, maxVal }: { data: { label: string; value: number }[]; maxVal: number }) {
  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-right shrink-0">{d.label}</span>
          <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: maxVal > 0 ? `${(d.value / maxVal) * 100}%` : "0%" }}
            />
          </div>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 w-6">{d.value}</span>
        </div>
      ))}
    </div>
  );
}

function PieChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return <p className="text-sm text-gray-400">No data yet</p>;

  let cumulative = 0;
  const gradientParts = segments.map((seg) => {
    const start = (cumulative / total) * 360;
    cumulative += seg.value;
    const end = (cumulative / total) * 360;
    return `${seg.color} ${start}deg ${end}deg`;
  });

  return (
    <div className="flex items-center gap-6">
      <div
        className="w-28 h-28 rounded-full shrink-0"
        style={{ background: `conic-gradient(${gradientParts.join(", ")})` }}
      />
      <div className="space-y-2">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
              {seg.label} ({Math.round((seg.value / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnalyticsPage() {
  const { user } = useAuth();
  const { bookings, loading } = useUserBookings();
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (user) {
      supabase
        .from("reviews")
        .select("*")
        .eq("user_id", user.id)
        .then(({ data }) => setReviews((data as Review[]) ?? []));
    }
  }, [user]);

  if (loading) return <div className="text-center py-16 text-gray-400">Loading...</div>;

  const totalSpent = bookings.reduce((sum, b) => {
    const court = courts.find((c) => c.id === b.court_id);
    return sum + (court?.hourlyRate ?? 0);
  }, 0);

  // Bookings by day of week
  const byDay = dayNames.map((label, i) => ({
    label,
    value: bookings.filter((b) => new Date(b.date + "T00:00").getDay() === i).length,
  }));
  const maxDay = Math.max(...byDay.map((d) => d.value), 1);

  // Bookings by month (last 6 months)
  const now = new Date();
  const byMonth = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const label = monthNames[d.getMonth()];
    const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const value = bookings.filter((b) => b.date.startsWith(yearMonth)).length;
    return { label, value };
  });
  const maxMonth = Math.max(...byMonth.map((d) => d.value), 1);

  // Surface breakdown
  const surfaceCounts: Record<string, number> = {};
  for (const b of bookings) {
    const court = courts.find((c) => c.id === b.court_id);
    if (court) surfaceCounts[court.surface] = (surfaceCounts[court.surface] ?? 0) + 1;
  }
  const surfaceSegments = [
    { label: "hard", value: surfaceCounts["hard"] ?? 0, color: "#3b82f6" },
    { label: "clay", value: surfaceCounts["clay"] ?? 0, color: "#f97316" },
    { label: "grass", value: surfaceCounts["grass"] ?? 0, color: "#22c55e" },
  ];

  // Badges
  const badges = calculateBadges(bookings, reviews);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Your Stats</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Analytics and achievements for your tennis journey</p>

      <StreakDisplay bookings={bookings} />

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <p className="text-3xl font-bold text-emerald-600">{bookings.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Bookings</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <p className="text-3xl font-bold text-emerald-600">₱{totalSpent.toLocaleString()}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Spent</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <p className="text-3xl font-bold text-emerald-600">{new Set(bookings.map((b) => b.court_id)).size}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Courts Visited</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <p className="text-3xl font-bold text-emerald-600">{badges.filter((b) => b.unlocked).length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Badges Earned</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Bookings by day */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">📊 Bookings by Day</h3>
          <BarChart data={byDay} maxVal={maxDay} />
        </div>

        {/* Bookings by month */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">📈 Last 6 Months</h3>
          <BarChart data={byMonth} maxVal={maxMonth} />
        </div>

        {/* Surface breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">🎾 Surface Breakdown</h3>
          <PieChart segments={surfaceSegments} />
        </div>

        {/* Time preference */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">⏰ Time Preference</h3>
          <PieChart
            segments={[
              { label: "Morning (7-11)", value: bookings.filter((b) => b.start_hour < 11).length, color: "#fbbf24" },
              { label: "Midday (11-3)", value: bookings.filter((b) => b.start_hour >= 11 && b.start_hour < 15).length, color: "#f97316" },
              { label: "Evening (3-8)", value: bookings.filter((b) => b.start_hour >= 15).length, color: "#8b5cf6" },
            ]}
          />
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">🏅 Achievements</h3>
        <BadgeGrid badges={badges} />
      </div>
    </div>
  );
}
