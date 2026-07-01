export type Surface = "hard" | "clay" | "grass";

export interface Court {
  id: string;
  name: string;
  location: string;
  city: string;
  surface: Surface;
  indoor: boolean;
  emoji: string;
  hourlyRate: number;
  lat: number;
  lng: number;
}
