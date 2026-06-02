export interface Court {
  id: string;
  name: string;
  location: string;
  surface: "hard" | "clay" | "grass";
  indoor: boolean;
  emoji: string;
  hourlyRate: number;
}

export interface Booking {
  id: string;
  user_id: string;
  court_id: string;
  date: string;
  start_hour: number;
  created_at: string;
}
