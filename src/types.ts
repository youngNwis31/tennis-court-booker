export interface Court {
  id: string;
  name: string;
  location: string;
  city: string;
  surface: "hard" | "clay" | "grass";
  indoor: boolean;
  emoji: string;
  hourlyRate: number;
  lat: number;
  lng: number;
}

export interface Review {
  id: string;
  user_id: string;
  court_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  court_id: string;
  date: string;
  start_hour: number;
  created_at: string;
}
