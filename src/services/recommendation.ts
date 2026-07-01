import type { Booking, Recommendation, Court } from "../types";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatHour(h: number): string {
  const suffix = h >= 12 ? "PM" : "AM";
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${display}:00 ${suffix}`;
}

function topEntry<T extends string | number>(counts: Record<T, number>): [T, number] | undefined {
  return (Object.entries(counts) as [T, number][]).sort((a, b) => b[1] - a[1])[0];
}

export function buildRecommendations(bookings: Booking[], courts: Court[]): Recommendation[] {
  if (bookings.length < 2) return [];

  const recs: Recommendation[] = [];

  const courtCounts: Record<string, number> = {};
  for (const b of bookings) {
    courtCounts[b.court_id] = (courtCounts[b.court_id] ?? 0) + 1;
  }

  const topCourtEntry = topEntry(courtCounts);
  if (topCourtEntry) {
    const [topCourtId, count] = topCourtEntry;
    const topCourt = courts.find((c) => c.id === topCourtId);
    if (topCourt) {
      recs.push({
        type: "book-again",
        emoji: topCourt.emoji,
        title: `Book ${topCourt.name} again`,
        description: `You've played here ${count} times — your most visited court.`,
        courtId: topCourt.id,
        link: `/court/${topCourt.id}`,
      });
    }
  }

  const dayCounts: Record<number, number> = {};
  const hourCounts: Record<number, number> = {};
  for (const b of bookings) {
    const day = new Date(b.date + "T00:00").getDay();
    dayCounts[day] = (dayCounts[day] ?? 0) + 1;
    hourCounts[b.start_hour] = (hourCounts[b.start_hour] ?? 0) + 1;
  }
  const topDay = topEntry(dayCounts);
  const topHour = topEntry(hourCounts);
  if (topDay && topHour) {
    recs.push({
      type: "pattern",
      emoji: "📊",
      title: "Your play pattern",
      description: `You usually play on ${DAY_NAMES[Number(topDay[0])]}s at ${formatHour(Number(topHour[0]))}. We'll keep those slots open for you!`,
    });
  }

  const surfaceCounts: Record<string, number> = {};
  for (const b of bookings) {
    const court = courts.find((c) => c.id === b.court_id);
    if (court) {
      surfaceCounts[court.surface] = (surfaceCounts[court.surface] ?? 0) + 1;
    }
  }
  const topSurfaceEntry = topEntry(surfaceCounts);
  const topSurface = topSurfaceEntry?.[0];
  if (topSurface) {
    recs.push({
      type: "surface",
      emoji: topSurface === "hard" ? "🏟️" : topSurface === "clay" ? "🧱" : "🌱",
      title: `${topSurface.charAt(0).toUpperCase() + topSurface.slice(1)} court fan`,
      description: `${Math.round((surfaceCounts[topSurface] / bookings.length) * 100)}% of your bookings are on ${topSurface} courts.`,
    });
  }

  const bookedCourtIds = new Set(Object.keys(courtCounts));
  const untriedCourts = courts.filter((c) => !bookedCourtIds.has(c.id));
  const suggested = untriedCourts.find((c) => c.surface === topSurface) ?? untriedCourts[0];
  if (suggested) {
    recs.push({
      type: "try-new",
      emoji: "✨",
      title: `Try ${suggested.name}`,
      description: `You haven't played here yet — it's a ${suggested.surface} court at ₱${suggested.hourlyRate}/hr.`,
      courtId: suggested.id,
      link: `/court/${suggested.id}`,
    });
  }

  return recs;
}
