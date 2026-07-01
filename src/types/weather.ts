export interface DayForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  precipProbability: number;
}

export interface WeatherInfo {
  label: string;
  emoji: string;
}
