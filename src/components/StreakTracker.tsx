import type { Booking } from "../types";

interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  thisWeekGoal: number;
  thisWeekPlayed: number;
  motivationMessage: string;
  streakEmoji: string;
}

export function calculateStreak(bookings: Booking[]): StreakInfo {
  if (bookings.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      thisWeekGoal: 2,
      thisWeekPlayed: 0,
      motivationMessage: "Book your first session to start your streak! 🎾",
      streakEmoji: "🌱",
    };
  }

  // Get unique weeks with bookings
  const weekSet = new Set<string>();
  const today = new Date();

  for (const b of bookings) {
    const d = new Date(b.date + "T00:00");
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    weekSet.add(weekStart.toISOString().split("T")[0]);
  }

  // Calculate current streak (consecutive weeks)
  let currentStreak = 0;
  const checkDate = new Date(today);
  checkDate.setDate(today.getDate() - today.getDay()); // Start of this week

  while (true) {
    const weekKey = checkDate.toISOString().split("T")[0];
    if (weekSet.has(weekKey)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 7);
    } else {
      break;
    }
  }

  // Longest streak
  const sortedWeeks = Array.from(weekSet).sort();
  let longestStreak = 1;
  let tempStreak = 1;
  for (let i = 1; i < sortedWeeks.length; i++) {
    const prev = new Date(sortedWeeks[i - 1]);
    const curr = new Date(sortedWeeks[i]);
    const diff = (curr.getTime() - prev.getTime()) / (7 * 24 * 60 * 60 * 1000);
    if (Math.round(diff) === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  // This week's bookings
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const weekStart = startOfWeek.toISOString().split("T")[0];
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  const weekEnd = endOfWeek.toISOString().split("T")[0];
  const thisWeekPlayed = bookings.filter((b) => b.date >= weekStart && b.date <= weekEnd).length;

  // Motivation
  let motivationMessage: string;
  let streakEmoji: string;

  if (currentStreak >= 8) {
    motivationMessage = "Incredible dedication! You're on a legendary streak! 🏆";
    streakEmoji = "🔥";
  } else if (currentStreak >= 4) {
    motivationMessage = "Amazing! Keep this momentum going! 💪";
    streakEmoji = "🔥";
  } else if (currentStreak >= 2) {
    motivationMessage = "Great consistency! You're building a habit! ⭐";
    streakEmoji = "⭐";
  } else if (currentStreak === 1) {
    motivationMessage = "Good start this week! Book again to keep the streak! 🎯";
    streakEmoji = "🎯";
  } else {
    motivationMessage = "Your streak ended — book a session to start a new one! 💪";
    streakEmoji = "💤";
  }

  return {
    currentStreak,
    longestStreak,
    thisWeekGoal: 2,
    thisWeekPlayed,
    motivationMessage,
    streakEmoji,
  };
}

export function StreakDisplay({ bookings }: { bookings: Booking[] }) {
  const streak = calculateStreak(bookings);
  const goalProgress = Math.min(100, (streak.thisWeekPlayed / streak.thisWeekGoal) * 100);

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            {streak.streakEmoji} Playing Streak
          </h3>
          <p className="text-white/80 text-sm mt-1">{streak.motivationMessage}</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-black">{streak.currentStreak}</p>
          <p className="text-xs text-white/70">week{streak.currentStreak !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white/15 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold">{streak.currentStreak}</p>
          <p className="text-[10px] text-white/70 mt-0.5">Current Streak</p>
        </div>
        <div className="bg-white/15 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold">{streak.longestStreak}</p>
          <p className="text-[10px] text-white/70 mt-0.5">Best Streak</p>
        </div>
        <div className="bg-white/15 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold">{streak.thisWeekPlayed}/{streak.thisWeekGoal}</p>
          <p className="text-[10px] text-white/70 mt-0.5">This Week</p>
        </div>
      </div>

      {/* Weekly goal progress */}
      <div>
        <div className="flex justify-between text-xs text-white/70 mb-1">
          <span>Weekly Goal</span>
          <span>{streak.thisWeekPlayed}/{streak.thisWeekGoal} sessions</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3">
          <div
            className="bg-white h-3 rounded-full transition-all duration-500"
            style={{ width: `${goalProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
