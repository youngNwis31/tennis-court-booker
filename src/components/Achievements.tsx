import type { Booking, Review } from "../types";
import { courts } from "../data/courts";

export interface Badge {
  id: string;
  emoji: string;
  name: string;
  description: string;
  unlocked: boolean;
}

export function calculateBadges(bookings: Booking[], reviews: Review[]): Badge[] {
  const uniqueCourts = new Set(bookings.map((b) => b.court_id));
  const uniqueSurfaces = new Set(
    bookings.map((b) => courts.find((c) => c.id === b.court_id)?.surface).filter(Boolean)
  );
  const weekendBookings = bookings.filter((b) => {
    const day = new Date(b.date + "T00:00").getDay();
    return day === 0 || day === 6;
  });
  const morningBookings = bookings.filter((b) => b.start_hour < 10);
  const eveningBookings = bookings.filter((b) => b.start_hour >= 17);

  return [
    {
      id: "first-booking",
      emoji: "🎉",
      name: "First Rally",
      description: "Make your first booking",
      unlocked: bookings.length >= 1,
    },
    {
      id: "five-bookings",
      emoji: "🔥",
      name: "On Fire",
      description: "Complete 5 bookings",
      unlocked: bookings.length >= 5,
    },
    {
      id: "ten-bookings",
      emoji: "🏆",
      name: "Court Champion",
      description: "Complete 10 bookings",
      unlocked: bookings.length >= 10,
    },
    {
      id: "all-surfaces",
      emoji: "🌈",
      name: "Surface Explorer",
      description: "Play on all 3 surface types",
      unlocked: uniqueSurfaces.size >= 3,
    },
    {
      id: "three-courts",
      emoji: "🗺️",
      name: "Court Hopper",
      description: "Book at 3 different courts",
      unlocked: uniqueCourts.size >= 3,
    },
    {
      id: "all-courts",
      emoji: "👑",
      name: "Court Collector",
      description: "Book at all 6 courts",
      unlocked: uniqueCourts.size >= 6,
    },
    {
      id: "weekend-warrior",
      emoji: "⚔️",
      name: "Weekend Warrior",
      description: "Book 3 weekend sessions",
      unlocked: weekendBookings.length >= 3,
    },
    {
      id: "early-bird",
      emoji: "🐦",
      name: "Early Bird",
      description: "Book 3 morning sessions (before 10 AM)",
      unlocked: morningBookings.length >= 3,
    },
    {
      id: "night-owl",
      emoji: "🦉",
      name: "Night Owl",
      description: "Book 3 evening sessions (5 PM or later)",
      unlocked: eveningBookings.length >= 3,
    },
    {
      id: "first-review",
      emoji: "✍️",
      name: "Critic",
      description: "Write your first review",
      unlocked: reviews.length >= 1,
    },
    {
      id: "five-reviews",
      emoji: "📝",
      name: "Top Reviewer",
      description: "Write 5 reviews",
      unlocked: reviews.length >= 5,
    },
    {
      id: "social",
      emoji: "🤝",
      name: "Social Player",
      description: "Create a matchmaking profile",
      unlocked: false, // Will be set dynamically
    },
  ];
}

export function BadgeGrid({ badges }: { badges: Badge[] }) {
  const unlocked = badges.filter((b) => b.unlocked);
  const locked = badges.filter((b) => !b.unlocked);

  return (
    <div>
      {unlocked.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Unlocked ({unlocked.length}/{badges.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {unlocked.map((badge) => (
              <div
                key={badge.id}
                className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-xl p-3 text-center"
              >
                <p className="text-3xl mb-1">{badge.emoji}</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{badge.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{badge.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {locked.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Locked ({locked.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {locked.map((badge) => (
              <div
                key={badge.id}
                className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-center opacity-50"
              >
                <p className="text-3xl mb-1 grayscale">🔒</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{badge.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{badge.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
