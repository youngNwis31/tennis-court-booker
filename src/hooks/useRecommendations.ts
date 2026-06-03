import { useMemo } from "react";
import type { Booking } from "../types";
import { courts } from "../data/courts";

export interface Recommendation {
  type: "book-again" | "try-new" | "pattern" | "surface";
  emoji: string;
  title: string;
  description: string;
  courtId?: string;
  link?: string;
}

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatHour(h: number): string {
  const suffix = h >= 12 ? "PM" : "AM";
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${display}:00 ${suffix}`;
}

export function useRecommendations(bookings: Booking[]): Recommendation[] {
  return useMemo(() => {
    if (bookings.length < 2) return [];

    const recs: Recommendation[] = [];

    // 1. Most booked court → "Book again"
    const courtCounts: Record<string, number> = {};
    for (const b of bookings) {
      courtCounts[b.court_id] = (courtCounts[b.court_id] ?? 0) + 1;
    }
    const topCourtId = Object.entries(courtCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topCourt = courts.find((c) => c.id === topCourtId);
    if (topCourt) {
      recs.push({
        type: "book-again",
        emoji: topCourt.emoji,
        title: `Book ${topCourt.name} again`,
        description: `You've played here ${courtCounts[topCourtId]} times — your most visited court.`,
        courtId: topCourt.id,
        link: `/court/${topCourt.id}`,
      });
    }

    // 2. Preferred day + time pattern
    const dayCounts: Record<number, number> = {};
    const hourCounts: Record<number, number> = {};
    for (const b of bookings) {
      const day = new Date(b.date + "T00:00").getDay();
      dayCounts[day] = (dayCounts[day] ?? 0) + 1;
      hourCounts[b.start_hour] = (hourCounts[b.start_hour] ?? 0) + 1;
    }
    const topDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0];
    const topHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
    if (topDay && topHour) {
      recs.push({
        type: "pattern",
        emoji: "📊",
        title: "Your play pattern",
        description: `You usually play on ${dayNames[Number(topDay[0])]}s at ${formatHour(Number(topHour[0]))}. We'll keep those slots open for you!`,
      });
    }

    // 3. Favorite surface → suggest courts with same surface they haven't tried
    const surfaceCounts: Record<string, number> = {};
    for (const b of bookings) {
      const court = courts.find((c) => c.id === b.court_id);
      if (court) {
        surfaceCounts[court.surface] = (surfaceCounts[court.surface] ?? 0) + 1;
      }
    }
    const topSurface = Object.entries(surfaceCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    if (topSurface) {
      recs.push({
        type: "surface",
        emoji: topSurface === "hard" ? "🏟️" : topSurface === "clay" ? "🧱" : "🌱",
        title: `${topSurface.charAt(0).toUpperCase() + topSurface.slice(1)} court fan`,
        description: `${Math.round((surfaceCounts[topSurface] / bookings.length) * 100)}% of your bookings are on ${topSurface} courts.`,
      });
    }

    // 4. Court they haven't tried yet
    const bookedCourtIds = new Set(Object.keys(courtCounts));
    const untriedCourts = courts.filter((c) => !bookedCourtIds.has(c.id));
    // Prefer courts with same surface
    const suggested = untriedCourts.find((c) => c.surface === topSurface) ?? untriedCourts[0];
    if (suggested) {
      recs.push({
        type: "try-new",
        emoji: "✨",
        title: `Try ${suggested.name}`,
        description: `You haven't played here yet — it's a ${suggested.surface} court at $${suggested.hourlyRate}/hr.`,
        courtId: suggested.id,
        link: `/court/${suggested.id}`,
      });
    }

    return recs;
  }, [bookings]);
}
