import type { Court } from "../types";
import { useWeather } from "../hooks/useWeather";
import { generateTips } from "../services/tips";

interface Props {
  court: Court;
  selectedHour: number | null;
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
