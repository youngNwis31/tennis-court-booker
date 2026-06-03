import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { courts } from "../data/courts";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

interface AlertResult {
  courtId: string;
  courtName: string;
  emoji: string;
  hourlyRate: number;
  availableSlots: number;
  date: string;
}

export function PriceAlert() {
  const { user } = useAuth();
  const [budget, setBudget] = useState(200);
  const [preferredTime, setPreferredTime] = useState<"morning" | "afternoon" | "evening" | "any">("any");
  const [alerts, setAlerts] = useState<AlertResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  // Load saved preferences
  useEffect(() => {
    const saved = localStorage.getItem("price-alert-prefs");
    if (saved) {
      const prefs = JSON.parse(saved);
      setBudget(prefs.budget ?? 200);
      setPreferredTime(prefs.preferredTime ?? "any");
    }
  }, []);

  const timeRanges: Record<string, [number, number]> = {
    morning: [7, 11],
    afternoon: [11, 15],
    evening: [15, 21],
    any: [7, 21],
  };

  const searchAlerts = async () => {
    setSearching(true);

    // Save preferences
    localStorage.setItem("price-alert-prefs", JSON.stringify({ budget, preferredTime }));

    const affordableCourts = courts.filter((c) => c.hourlyRate <= budget);
    const results: AlertResult[] = [];
    const today = new Date();
    const [minHour, maxHour] = timeRanges[preferredTime];

    for (let d = 0; d < 3; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() + d);
      const dateStr = date.toISOString().split("T")[0];

      for (const court of affordableCourts) {
        const { data } = await supabase
          .from("bookings")
          .select("start_hour")
          .eq("court_id", court.id)
          .eq("date", dateStr);

        const bookedHours = new Set((data ?? []).map((b: { start_hour: number }) => b.start_hour));
        let available = 0;
        for (let h = minHour; h < maxHour; h++) {
          if (!bookedHours.has(h)) available++;
        }

        if (available > 0) {
          results.push({
            courtId: court.id,
            courtName: court.name,
            emoji: court.emoji,
            hourlyRate: court.hourlyRate,
            availableSlots: available,
            date: dateStr,
          });
        }
      }
    }

    results.sort((a, b) => a.hourlyRate - b.hourlyRate);
    setAlerts(results.slice(0, 8));
    setSearching(false);
    setSearched(true);
  };

  if (!user) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
        <span>💰</span> Smart Price Alerts
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Set your budget and preferred time — we'll find available slots that match
      </p>

      <div className="flex flex-wrap gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Max Budget</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={50}
              max={1500}
              step={50}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-32 accent-emerald-500"
            />
            <span className="text-sm font-bold text-emerald-600 w-20">₱{budget}/hr</span>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Preferred Time</label>
          <select
            value={preferredTime}
            onChange={(e) => setPreferredTime(e.target.value as typeof preferredTime)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white text-sm"
          >
            <option value="any">Any time</option>
            <option value="morning">Morning (7-11 AM)</option>
            <option value="afternoon">Afternoon (11 AM-3 PM)</option>
            <option value="evening">Evening (3-8 PM)</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={searchAlerts}
            disabled={searching}
            className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {searching ? "Searching..." : "Find Deals"}
          </button>
        </div>
      </div>

      {searched && alerts.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">
          No courts found under ₱{budget}/hr at your preferred time. Try increasing your budget.
        </p>
      )}

      {alerts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {alerts.map((a, i) => {
            const dateLabel = new Date(a.date + "T00:00").toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            });
            return (
              <Link
                key={i}
                to={`/court/${a.courtId}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
              >
                <span className="text-xl">{a.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{a.courtName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {dateLabel} • {a.availableSlots} slot{a.availableSlots !== 1 ? "s" : ""} open
                  </p>
                </div>
                <span className="text-sm font-bold text-emerald-600">₱{a.hourlyRate}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
