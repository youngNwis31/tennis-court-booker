import type { Court } from "../types";
import { isRainy } from "./weather";
import { MAX_TIPS } from "../config/constants";

export function generateTips(court: Court, hour: number | null, weatherCode: number | null, temp: number | null): string[] {
  const tips: string[] = [];

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

  if (court.surface === "clay") {
    tips.push("🧱 Clay courts play slower with higher bounces — use topspin and patience.");
  } else if (court.surface === "grass") {
    tips.push("🌱 Grass courts play fast with low bounces — serve-and-volley works great here.");
  } else if (court.surface === "hard") {
    tips.push("🏟️ Hard courts offer consistent bounce — good for all playing styles.");
  }

  if (court.indoor) {
    tips.push("🏢 Indoor courts have no wind or sun — focus on precise shot placement.");
  }

  if (court.hourlyRate >= 500) {
    tips.push("✨ Premium court — likely has great facilities. Check for lockers, showers, and equipment rental.");
  }

  if (court.hourlyRate <= 100) {
    tips.push("💡 Budget-friendly spot — bring your own water and towel as amenities may be limited.");
  }

  return tips.slice(0, MAX_TIPS);
}
