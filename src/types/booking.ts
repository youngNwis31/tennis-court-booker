export interface Booking {
  id: string;
  user_id: string;
  court_id: string;
  date: string;
  start_hour: number;
  created_at: string;
}

export interface BookingIntent {
  surface?: string;
  date?: string;
  hour?: number;
}
