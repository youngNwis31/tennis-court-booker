import { useState } from "react";
import { Link } from "react-router-dom";
import { courts } from "../data/courts";
import { useUserBookings } from "../hooks/useBookings";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

interface SlotSuggestion {
  courtId: string;
  courtName: string;
  emoji: string;
  date: string;
  hour: number;
  score: number;
  reasons: string[];
}

function formatHour(h: number): string {
  const suffix = h >= 12 ? "PM" : "AM";
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${display}:00 ${suffix}`;
}

export function OptimalSlotFinder() {
  const { user } = useAuth();
  const { bookings } = useUserBookings();
  const [suggestions, setSuggestions] = useState<SlotSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const findOptimalSlots = async () => {
    setLoading(true);

    // Analyze user patterns
    const hourCounts: Record<number, number> = {};
    const surfaceCounts: Record<string, number> = {};
    for (const b of bookings) {
      hourCounts[b.start_hour] = (hourCounts[b.start_hour] ?? 0) + 1;
      const court = courts.find((c) => c.id === b.court_id);
      if (court) surfaceCounts[court.surface] = (surfaceCounts[court.surface] ?? 0) + 1;
    }
    const prefHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
    const prefSurface = Object.entries(surfaceCounts).sort((a, b) => b[1] - a[1])[0];

    // Check next 3 days
    const results: SlotSuggestion[] = [];
    const today = new Date();

    for (let d = 0; d < 3; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() + d);
      const dateStr = date.toISOString().split("T")[0];

      for (const court of courts) {
        // Fetch existing bookings for this court/date
        const { data } = await supabase
          .from("bookings")
          .select("start_hour")
          .eq("court_id", court.id)
          .eq("date", dateStr);
        const bookedHours = new Set((data ?? []).map((b: { start_hour: number }) => b.start_hour));

        // Score available hours
        const hours = Array.from({ length: 14 }, (_, i) => i + 7);
        for (const hour of hours) {
          if (bookedHours.has(hour)) continue;

          let score = 50; // base
          const reasons: string[] = [];

          // Prefer user's usual time
          if (prefHour && hour === Number(prefHour[0])) {
            score += 20;
            reasons.push("Your preferred time");
          }

          // Prefer user's usual surface
          if (prefSurface && court.surface === prefSurface[0]) {
            score += 15;
            reasons.push(`Your preferred surface (${court.surface})`);
          }

          // Cheaper = better
          if (court.hourlyRate <= 150) {
            score += 10;
            reasons.push("Great value");
          }

          // Indoor bonus when it might rain (afternoon in PH = common rain)
          if (court.indoor && hour >= 14) {
            score += 10;
            reasons.push("Indoor — safe from afternoon rain");
          }

          // Today bonus
          if (d === 0) {
            score += 5;
            reasons.push("Available today");
          }

          // Morning/evening premium times
          if (hour >= 6 && hour <= 8) {
            score += 5;
            reasons.push("Cool morning session");
          }
          if (hour >= 17 && hour <= 19) {
            score += 5;
            reasons.push("Popular evening slot");
          }

          if (reasons.length === 0) reasons.push("Available slot");

          results.push({
            courtId: court.id,
            courtName: court.name,
            emoji: court.emoji,
            date: dateStr,
            hour,
            score,
            reasons,
          });
        }
      }
    }

    // Sort by score and take top 5
    results.sort((a, b) => b.score - a.score);
    setSuggestions(results.slice(0, 5));
    setLoading(false);
    setSearched(true);
  };

  if (!user) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>🧠</span> AI Optimal Slot Finder
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Finds the perfect court and time based on your habits, price, and availability
          </p>
        </div>
        <button
          onClick={findOptimalSlots}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 transition-all shadow-md"
        >
          {loading ? "Analyzing..." : searched ? "Refresh" : "Find Best Slots"}
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-3">
          {suggestions.map((s, i) => {
            const dateLabel = new Date(s.date + "T00:00").toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            });
            return (
              <div
                key={i}
                className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600"
              >
                <div className="text-2xl">{s.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{s.courtName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {dateLabel} at {formatHour(s.hour)}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {s.reasons.map((r, j) => (
                      <span key={j} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold text-emerald-600">{s.score}%</div>
                  <Link
                    to={`/court/${s.courtId}`}
                    className="text-xs text-emerald-600 hover:underline"
                  >
                    Book →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
