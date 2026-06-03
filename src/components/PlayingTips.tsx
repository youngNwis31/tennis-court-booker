import type { Court } from "../types";
import { useWeather, isRainy } from "../hooks/useWeather";

interface Props {
  court: Court;
  selectedHour: number | null;
}

function generateTips(court: Court, hour: number | null, weatherCode: number | null, temp: number | null): string[] {
  const tips: string[] = [];

  // Weather-based tips
  if (weatherCode !== null) {
    if (isRainy(weatherCode) && !court.indoor) {
      tips.push("🌧️ Rain is expected — consider booking an indoor court instead, or bring a rain jacket!");
    }
    if (isRainy(weatherCode) && court.surface === "clay") {
      tips.push("🧱 Clay courts get slippery when wet — use shoes with good grip and expect slower play.");
    }
    if (temp !== null && temp > 32) {
      tips.push("🥵 It's going to be hot! Bring extra water, wear sunscreen, and take breaks between sets.");
    }
    if (temp !== null && temp > 28 && !court.indoor) {
      tips.push("☀️ Apply sunscreen before playing outdoors — UV is strong in the Philippines.");
    }
    if (weatherCode >= 0 && weatherCode <= 2 && !court.indoor) {
      tips.push("😎 Great weather for tennis! Perfect conditions for outdoor play.");
    }
  }

  // Time-based tips
  if (hour !== null) {
    if (hour >= 11 && hour <= 14 && !court.indoor) {
      tips.push("☀️ Midday heat can be intense — warm up thoroughly and stay hydrated.");
    }
    if (hour <= 8) {
      tips.push("🌅 Early morning sessions are cooler — perfect for intense training!");
    }
    if (hour >= 17) {
      tips.push("🌆 Evening slots are popular — courts may have lights. Enjoy the cooler breeze!");
    }
  }

  // Surface-based tips
  if (court.surface === "clay") {
    tips.push("🧱 Clay courts play slower with higher bounces — use topspin and patience.");
  } else if (court.surface === "grass") {
    tips.push("🌱 Grass courts play fast with low bounces — serve-and-volley works great here.");
  } else if (court.surface === "hard") {
    tips.push("🏟️ Hard courts offer consistent bounce — good for all playing styles.");
  }

  // Court-specific tips
  if (court.indoor) {
    tips.push("🏢 Indoor courts have no wind or sun — focus on precise shot placement.");
  }

  if (court.hourlyRate >= 500) {
    tips.push("✨ Premium court — likely has great facilities. Check for lockers, showers, and equipment rental.");
  }

  if (court.hourlyRate <= 100) {
    tips.push("💡 Budget-friendly spot — bring your own water and towel as amenities may be limited.");
  }

  return tips.slice(0, 4); // Max 4 tips
}

export function PlayingTips({ court, selectedHour }: Props) {
  const { forecast } = useWeather(court.lat, court.lng);
  const todayWeather = forecast[0];

  const tips = generateTips(
    court,
    selectedHour,
    todayWeather?.weatherCode ?? null,
    todayWeather?.tempMax ?? null
  );

  if (tips.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-700 p-5 mb-6">
      <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-300 mb-3 flex items-center gap-2">
        <span>🤖</span> AI Playing Tips
      </h3>
      <div className="space-y-2">
        {tips.map((tip, i) => (
          <p key={i} className="text-sm text-indigo-900 dark:text-indigo-200">{tip}</p>
        ))}
      </div>
    </div>
  );
}
